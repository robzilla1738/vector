// Node-API surface of aux-macos-utilities.node: run(command, input) -> JSON text, plus the
// native shutdown ABI the daemon host looks up with dlsym. Contract: docs/spec/native/macos-utilities.md.
#define NAPI_VERSION 8
#include <node_api.h>
#include <dlfcn.h>
#include <pthread.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

// Swift side (Owner.swift).
void *aux_mu_create(void);
char *aux_mu_run(void *owner, const char *command, const char *input);
bool aux_mu_close(void *owner);
void aux_mu_release(void *owner);

// One per Node Environment (the main thread and each worker that loads the addon). An instance
// whose Environment is gone stays listed until its in-flight OS requests have answered.
typedef struct Instance {
  void *owner;  // NULL once released
  bool busy, closed, environment_gone;
  struct Instance *next;
} Instance;

static pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
static Instance *instances;
static bool process_closed;
static pid_t image_process;

// A forked child inherits the loaded image but none of its custody.
__attribute__((constructor)) static void remember_process(void) { image_process = getpid(); }

// Lock held. Closes the instance for good and releases its owner once nothing is in flight.
static bool close_locked(Instance *instance) {
  instance->closed = true;
  if (!instance->owner) return true;
  if (!aux_mu_close(instance->owner) || instance->busy) return false;
  aux_mu_release(instance->owner);
  instance->owner = NULL;
  return true;
}

// Lock held. Frees the instance once its Environment is gone and its owner released.
static void forget_if_done_locked(Instance *instance) {
  if (instance->owner || !instance->environment_gone) return;
  for (Instance **link = &instances; *link; link = &(*link)->next) {
    if (*link == instance) {
      *link = instance->next;
      break;
    }
  }
  free(instance);
}

// 0 drained, 1 still pending, -1 called from a forked child. Closure is permanent: later
// Environments cannot attach and existing ones refuse new calls.
int32_t AuxMacUtilityCloseAdmissionAndDrain(void) {
  if (getpid() != image_process) return -1;
  int32_t result = 0;
  pthread_mutex_lock(&lock);
  process_closed = true;
  for (Instance *instance = instances, *next; instance; instance = next) {
    next = instance->next;
    if (!close_locked(instance)) result = 1;
    forget_if_done_locked(instance);
  }
  pthread_mutex_unlock(&lock);
  return result;
}

// Environments whose owner is still held (live, or closed with requests in flight).
uint64_t AuxMacUtilityPendingEnvironments(void) {
  if (getpid() != image_process) return UINT64_MAX;
  uint64_t count = 0;
  pthread_mutex_lock(&lock);
  for (Instance *instance = instances; instance; instance = instance->next) count += instance->owner || instance->busy;
  pthread_mutex_unlock(&lock);
  return count;
}

static napi_value throw_type_error(napi_env env, const char *message) {
  napi_throw_type_error(env, NULL, message);
  return NULL;
}

static napi_value throw_error(napi_env env, const char *message) {
  napi_throw_error(env, NULL, message);
  return NULL;
}

// A malloc'd UTF-8 copy, or NULL when the value is not a string or contains NUL.
static char *read_string(napi_env env, napi_value value) {
  size_t length = 0;
  if (napi_get_value_string_utf8(env, value, NULL, 0, &length) != napi_ok) return NULL;
  char *text = malloc(length + 1);
  if (!text) return NULL;
  if (napi_get_value_string_utf8(env, value, text, length + 1, &length) != napi_ok || strlen(text) != length) {
    free(text);
    return NULL;
  }
  return text;
}

static napi_value run(napi_env env, napi_callback_info info) {
  size_t argc = 2;
  napi_value argv[2];
  Instance *instance = NULL;
  if (napi_get_cb_info(env, info, &argc, argv, NULL, (void **)&instance) != napi_ok || !instance)
    return throw_error(env, "Native utility callback unavailable");
  if (argc == 0) return throw_type_error(env, "run(command, input) requires a command");

  char *command = read_string(env, argv[0]);
  char *input = argc > 1 ? read_string(env, argv[1]) : strdup("");
  if (!command || !input) {
    free(command);
    free(input);
    return throw_type_error(env, "Native utility command and input must be strings without NUL");
  }

  pthread_mutex_lock(&lock);
  const char *refusal = instance->closed || !instance->owner ? "Native utility admission is closed"
                        : instance->busy                     ? "Native utility call is reentrant"
                                                             : NULL;
  instance->busy = !refusal;
  void *owner = instance->owner;
  pthread_mutex_unlock(&lock);

  char *output = refusal ? NULL : aux_mu_run(owner, command, input);
  free(command);
  free(input);
  if (refusal) return throw_error(env, refusal);
  pthread_mutex_lock(&lock);
  instance->busy = false;
  pthread_mutex_unlock(&lock);
  if (!output) return throw_error(env, "Native utility returned no output");

  napi_value result = NULL;
  napi_create_string_utf8(env, output, NAPI_AUTO_LENGTH, &result);
  free(output);
  return result;
}

static void environment_cleanup(void *data) {
  if (getpid() != image_process) return;
  Instance *instance = data;
  pthread_mutex_lock(&lock);
  instance->environment_gone = true;
  close_locked(instance);
  forget_if_done_locked(instance);
  pthread_mutex_unlock(&lock);
}

// QuickLook and NSWorkspace callbacks can outlive a terminated worker. Take one extra
// reference on this image so a worker's Environment teardown never unmaps their code.
static void retain_own_image(void) {
  Dl_info info;
  if (dladdr((const void *)retain_own_image, &info) && info.dli_fname)
    dlopen(info.dli_fname, RTLD_NOLOAD | RTLD_NOW);
}

NAPI_MODULE_INIT() {
  retain_own_image();
  Instance *instance = calloc(1, sizeof *instance);
  if (!instance) return throw_error(env, "Mac utility host allocation failed");
  pthread_mutex_lock(&lock);
  bool admitted = !process_closed && getpid() == image_process && (instance->owner = aux_mu_create());
  if (admitted) instance->next = instances, instances = instance;
  pthread_mutex_unlock(&lock);
  if (!admitted) {
    free(instance);
    return throw_error(env, "Mac utility Environment attachment failed");
  }

  napi_value fn;
  napi_property_descriptor property = {"run", NULL, NULL, NULL, NULL, NULL, napi_default, NULL};
  if (napi_add_env_cleanup_hook(env, environment_cleanup, instance) != napi_ok) {
    environment_cleanup(instance);
    return throw_error(env, "Mac utility host cleanup attachment failed");
  }
  if (napi_create_function(env, "run", NAPI_AUTO_LENGTH, run, instance, &fn) != napi_ok ||
      (property.value = fn, napi_define_properties(env, exports, 1, &property)) != napi_ok)
    return throw_error(env, "Mac utility Environment attachment failed");
  return exports;
}
