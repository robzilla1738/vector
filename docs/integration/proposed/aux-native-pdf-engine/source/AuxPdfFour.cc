// Reconstructed original synchronous PDF4 surface. Inactive, no original addon use.
#include <node_api.h>
#include "fpdfview.h"
#include "fpdf_text.h"
#include "fpdf_formfill.h"
#include "fpdf_ppo.h"
#include "fpdf_edit.h"
#include "fpdf_save.h"
#include "RecoveredPdfPageSelection.h"
#include <cmath>
#include <codecvt>
#include <cstdio>
#include <filesystem>
#include <fstream>
#include <locale>
#include <mutex>
#include <stdexcept>
#include <string>
#include <vector>
namespace aux::pdf { std::vector<int> ReadPageNumbers(napi_env,napi_value,int); }
namespace {
std::mutex pdf_mutex;
napi_value Object(napi_env env){napi_value v{};napi_create_object(env,&v);return v;}
napi_value Array(napi_env env,size_t size){napi_value v{};napi_create_array_with_length(env,size,&v);return v;}
void Set(napi_env env,napi_value object,const char*key,napi_value value){napi_set_named_property(env,object,key,value);}
void SetInt(napi_env env,napi_value object,const char*key,int number){napi_value v{};napi_create_int32(env,number,&v);Set(env,object,key,v);}
void SetString(napi_env env,napi_value object,const char*key,const std::string&text){napi_value v{};napi_create_string_utf8(env,text.data(),text.size(),&v);Set(env,object,key,v);}
napi_value Get(napi_env env,napi_value object,const char*key){napi_value v{};napi_get_named_property(env,object,key,&v);return v;}
bool Has(napi_env env,napi_value object,const char*key){bool has=false;napi_has_named_property(env,object,key,&has);return has;}
std::string String(napi_env env,napi_value value){size_t length=0;napi_get_value_string_utf8(env,value,nullptr,0,&length);std::vector<char> bytes(length+1);napi_get_value_string_utf8(env,value,bytes.data(),bytes.size(),&length);return {bytes.data(),length};}
std::string RequiredString(napi_env env,napi_value object,const char*key){
  if(!Has(env,object,key))throw std::runtime_error(std::string("Missing ")+key);
  auto value=Get(env,object,key);napi_valuetype type=napi_undefined;napi_typeof(env,value,&type);
  if(type!=napi_string)throw std::runtime_error(std::string(key)+" must be a string");
  return String(env,value);
}
double RequiredNumber(napi_env env,napi_value object,const char*key){
  if(!Has(env,object,key))throw std::runtime_error(std::string("Missing ")+key);
  auto value=Get(env,object,key);napi_valuetype type=napi_undefined;napi_typeof(env,value,&type);double number=0;
  if(type!=napi_number||napi_get_value_double(env,value,&number)!=napi_ok||!std::isfinite(number))throw std::runtime_error(std::string(key)+" must be a finite number");
  return number;
}
struct Library {
  Library(){FPDF_LIBRARY_CONFIG config{};config.version=2;FPDF_InitLibraryWithConfig(&config);}
  ~Library(){FPDF_DestroyLibrary();}
};
struct Document {
  std::vector<char> bytes;FPDF_DOCUMENT document=nullptr;FPDF_FORMFILLINFO callbacks{};FPDF_FORMHANDLE form=nullptr;
  explicit Document(const std::string&path){
    std::ifstream input(std::filesystem::u8path(path),std::ios::binary|std::ios::ate);
    if(!input)throw std::runtime_error("Failed to open PDF file");
    auto count=input.tellg();if(count<=0)throw std::runtime_error("PDF file is empty");
    bytes.resize(static_cast<size_t>(count));input.seekg(0);input.read(bytes.data(),count);
    if(!input)throw std::runtime_error("Failed to read PDF file");
    document=FPDF_LoadMemDocument64(bytes.data(),bytes.size(),nullptr);
    if(!document)throw std::runtime_error("Failed to open PDF (PDFium error "+std::to_string(FPDF_GetLastError())+")");
    callbacks.version=1;form=FPDFDOC_InitFormFillEnvironment(document,&callbacks);
    if(!form){FPDF_CloseDocument(document);document=nullptr;throw std::runtime_error("Failed to initialize AcroForm support");}
  }
  ~Document(){if(form)FPDFDOC_ExitFormFillEnvironment(form);if(document)FPDF_CloseDocument(document);}
  Document(const Document&)=delete;Document&operator=(const Document&)=delete;
};
struct NewDocument {
  FPDF_DOCUMENT document=FPDF_CreateNewDocument();
  NewDocument(){if(!document)throw std::runtime_error("Failed to create PDF");}
  ~NewDocument(){FPDF_CloseDocument(document);}
  NewDocument(const NewDocument&)=delete;NewDocument&operator=(const NewDocument&)=delete;
};
struct Page {
  Document&doc;FPDF_PAGE page;
  Page(Document&d,int index):doc(d),page(FPDF_LoadPage(d.document,index)){if(page)FORM_OnAfterLoadPage(page,doc.form);}
  ~Page(){if(page){FORM_OnBeforeClosePage(page,doc.form);FPDF_ClosePage(page);}}
  Page(const Page&)=delete;Page&operator=(const Page&)=delete;
};
struct TextPage {
  FPDF_TEXTPAGE page;
  explicit TextPage(FPDF_PAGE p):page(FPDFText_LoadPage(p)){}
  ~TextPage(){if(page)FPDFText_ClosePage(page);}
};
struct Writer:FPDF_FILEWRITE {
  std::ofstream output;
  explicit Writer(const std::filesystem::path&path):output(path,std::ios::binary|std::ios::trunc){version=1;WriteBlock=&Write;}
  static int Write(FPDF_FILEWRITE*writer,const void*data,unsigned long size){auto*self=static_cast<Writer*>(writer);self->output.write(static_cast<const char*>(data),size);return self->output.good()?1:0;}
};
void Save(FPDF_DOCUMENT document,const std::string&output){
  auto path=std::filesystem::u8path(output);if(path.has_parent_path())std::filesystem::create_directories(path.parent_path());
  Writer writer(path);if(!writer.output.is_open()||!FPDF_SaveAsCopy(document,&writer,FPDF_NO_INCREMENTAL))throw std::runtime_error("Failed to write PDF");
}
std::string Utf8(const unsigned short*bytes,size_t count){
  const auto*start=reinterpret_cast<const char16_t*>(bytes);
  return std::wstring_convert<std::codecvt_utf8_utf16<char16_t>,char16_t>{}.to_bytes(start,start+count);
}
napi_value ExtractText(napi_env env,napi_value input){
  Document doc(RequiredString(env,input,"filePath"));int count=FPDF_GetPageCount(doc.document);
  auto selected=aux::pdf::ReadPageNumbers(env,input,count);auto pages=Array(env,selected.size());
  for(size_t i=0;i<selected.size();++i){int number=selected[i];Page page(doc,number-1);
    if(!page.page)throw std::runtime_error("Failed to read PDF page "+std::to_string(number));
    TextPage text(page.page);if(!text.page)throw std::runtime_error("Failed to read PDF text on page "+std::to_string(number));
    int size=FPDFText_CountChars(text.page);if(size<0)throw std::runtime_error("Failed to read PDF text on page "+std::to_string(number));
    std::vector<unsigned short> buffer(static_cast<size_t>(size)+1);
    int written=FPDFText_GetText(text.page,0,size,buffer.data());
    std::string value=written>0?Utf8(buffer.data(),written-1):std::string{};
    auto item=Object(env);SetInt(env,item,"page",number);SetString(env,item,"text",value);napi_set_element(env,pages,i,item);
  }
  auto result=Object(env);SetInt(env,result,"pageCount",count);Set(env,result,"pages",pages);return result;
}
napi_value Merge(napi_env env,napi_value input){
  if(!Has(env,input,"files"))throw std::runtime_error("Missing files");auto files=Get(env,input,"files");bool array=false;napi_is_array(env,files,&array);
  if(!array)throw std::runtime_error("files must be an array");uint32_t length=0;napi_get_array_length(env,files,&length);if(length==0)throw std::runtime_error("files must not be empty");
  auto output=RequiredString(env,input,"outputPath");NewDocument merged;
  for(uint32_t i=0;i<length;++i){napi_value file{};napi_get_element(env,files,i,&file);auto path=RequiredString(env,file,"filePath");Document doc(path);
    auto pages=aux::pdf::ReadPageNumbers(env,file,FPDF_GetPageCount(doc.document));std::vector<int> indexes;for(int page:pages)indexes.push_back(page-1);
    if(!FPDF_ImportPagesByIndex(merged.document,doc.document,indexes.data(),indexes.size(),FPDF_GetPageCount(merged.document)))throw std::runtime_error("Failed to merge PDF "+path);
  }
  Save(merged.document,output);auto result=Object(env);SetString(env,result,"outputPath",output);SetInt(env,result,"pageCount",FPDF_GetPageCount(merged.document));return result;
}
napi_value Rotate(napi_env env,napi_value input){
  auto file=RequiredString(env,input,"filePath"),output=RequiredString(env,input,"outputPath");double degrees=RequiredNumber(env,input,"degrees");
  if(degrees!=-270&&degrees!=-180&&degrees!=-90&&degrees!=90&&degrees!=180&&degrees!=270)throw std::runtime_error("degrees must be -270, -180, -90, 90, 180, or 270");
  Document doc(file);int count=FPDF_GetPageCount(doc.document);auto selected=aux::pdf::ReadPageNumbers(env,input,count);auto pages=Array(env,selected.size());
  for(size_t i=0;i<selected.size();++i){int number=selected[i];Page page(doc,number-1);if(!page.page)throw std::runtime_error("Failed to load PDF page "+std::to_string(number));int rotation=FPDFPage_GetRotation(page.page);
    if(rotation<0)throw std::runtime_error("Failed to read PDF page rotation");int quarter=static_cast<int>(degrees/90);FPDFPage_SetRotation(page.page,((rotation+quarter)%4+4)%4);napi_value value{};napi_create_int32(env,number,&value);napi_set_element(env,pages,i,value);
  }
  Save(doc.document,output);auto result=Object(env);SetString(env,result,"outputPath",output);SetInt(env,result,"pageCount",count);Set(env,result,"pages",pages);return result;
}
napi_value Split(napi_env env,napi_value input){
  auto file=RequiredString(env,input,"filePath"),directory=RequiredString(env,input,"outputDir");Document doc(file);int count=FPDF_GetPageCount(doc.document);auto selected=aux::pdf::ReadPageNumbers(env,input,count);std::filesystem::create_directories(std::filesystem::u8path(directory));auto pages=Array(env,selected.size());
  for(size_t i=0;i<selected.size();++i){int number=selected[i],index=number-1;NewDocument output;
    if(!FPDF_ImportPagesByIndex(output.document,doc.document,&index,1,0))throw std::runtime_error("Failed to split PDF page "+std::to_string(number));
    char name[64];std::snprintf(name,sizeof(name),"page_%03d.pdf",number);auto path=(std::filesystem::u8path(directory)/name).u8string();Save(output.document,path);
    auto item=Object(env);SetInt(env,item,"page",number);SetString(env,item,"path",path);napi_set_element(env,pages,i,item);
  }
  auto result=Object(env);SetInt(env,result,"pageCount",count);Set(env,result,"pages",pages);return result;
}
template<napi_value(*Operation)(napi_env,napi_value)>napi_value Run(napi_env env,napi_callback_info info){
  size_t argc=1;napi_value input{};napi_get_cb_info(env,info,&argc,&input,nullptr,nullptr);
  if(argc<1){napi_throw_type_error(env,nullptr,"PDF operation requires an input object");return nullptr;}
  std::lock_guard<std::mutex> guard(pdf_mutex);
  try{Library library;return Operation(env,input);}catch(const std::exception&error){napi_throw_error(env,nullptr,error.what());return nullptr;}
}
}
NAPI_MODULE_INIT(){
  auto pdf=Object(env);
  struct Export{const char*name;napi_callback callback;};
  const Export methods[]={{"extractText",Run<ExtractText>},{"merge",Run<Merge>},{"rotate",Run<Rotate>},{"split",Run<Split>}};
  for(const auto&method:methods){napi_value function{};napi_create_function(env,method.name,NAPI_AUTO_LENGTH,method.callback,nullptr,&function);Set(env,pdf,method.name,function);}
  Set(env,exports,"pdf",pdf);return exports;
}
