/* Aux-owned source: a routine's schedule (assets/provider-Cw0zhujt.js, jo through Vo): the 15-minute time
 * combobox that also takes typed times, the RRULE parsing and building behind the Repeat, Every, On
 * and Time fields, and the routines mutations. A rule the fields cannot express shows as Custom with
 * its raw RRULE. A typed hour under 13 without AM or PM picks the next time after the current one.
 * Names the rest of the chunk uses keep their chunk names: ko the default rule, rt/ln format and parse a time, cn the Repeat choices,
 * $o useDefaultModel, Fo the fields, Vo useRoutineMutations (exported).
 * Chunk names used: c React, r JSX runtime, L cn, De Input, Ie/he buttonVariants and Button, ce the
 * chevron, Tn checkmark, Ls/Ks Popover, pe dayjs, Le useFormContext, Ke/Ue/ut/Ve/we Select parts, Mn/ot/it
 * Field group, field and label, vt/gt/xt/be/jn menu, We agent settings, Q useTRPC, Re useQueryClient, ne useMutation. */
/** Every 15 minutes of the day. */
  QUARTER_HOURS = Array.from({length: 96}, (e, t) => t * 15),
  /** The time combobox: picks from the list or takes a typed time. */
  TimeCombobox = ({hour, minute, 'aria-label': label = 'Time', className, onValueChange}) => {
    const [open, setOpen] = (0, c.useState)(false),
      [isTyping, setIsTyping] = (0, c.useState)(false),
      [typedValue, setTypedValue] = (0, c.useState)(''),
      [hoveredMinutes, setHoveredMinutes] = (0, c.useState)(null),
      [anchorMinutes, setAnchorMinutes] = (0, c.useState)(hour * 60 + minute),
      referenceMinutes = (0, c.useRef)(hour * 60 + minute),
      anchorRef = (0, c.useRef)(null),
      inputRef = (0, c.useRef)(null),
      listRef = (0, c.useRef)(null),
      listId = (0, c.useId)(),
      currentMinutes = hour * 60 + minute,
      typedTime = isTyping ? ln(typedValue, referenceMinutes.current) : {hour, minute},
      options = [...new Set([...QUARTER_HOURS, currentMinutes])].sort((left, right) => left - right),
      activeMinutes = hoveredMinutes ?? anchorMinutes,
      inputValue = isTyping ? typedValue : rt(hour, minute),
      openList = () => {
        open || ((referenceMinutes.current = currentMinutes), setAnchorMinutes(currentMinutes), setOpen(true));
      },
      closeList = commit => {
        (commit && isTyping && typedTime && onValueChange(typedTime),
          setOpen(false),
          setIsTyping(false),
          setHoveredMinutes(null));
      },
      pickMinutes = minutes => {
        (onValueChange({hour: Math.floor(minutes / 60), minute: minutes % 60}),
          setOpen(false),
          setIsTyping(false),
          setHoveredMinutes(null),
          inputRef.current?.focus());
      },
      typeValue = text => {
        openList();
        const parsed = ln(text, referenceMinutes.current);
        if (parsed) {
          const target = parsed.hour * 60 + parsed.minute;
          setAnchorMinutes(
            options.reduce(
              (closest, candidate) => (Math.abs(candidate - target) < Math.abs(closest - target) ? candidate : closest),
              options[0],
            ),
          );
        }
        (setTypedValue(text), setIsTyping(true), setHoveredMinutes(null));
      },
      handleKeyDown = event => {
        if (!event.nativeEvent.isComposing)
          if (
            (isTyping &&
              typedTime &&
              event.currentTarget.selectionStart === 0 &&
              event.currentTarget.selectionEnd === typedValue.length &&
              !event.metaKey &&
              !event.ctrlKey &&
              !event.altKey &&
              (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') &&
              (referenceMinutes.current = typedTime.hour * 60 + typedTime.minute),
            event.key === 'Escape' && open)
          )
            (event.preventDefault(), event.stopPropagation(), closeList(false));
          else if (event.key === 'Tab') closeList(true);
          else if (event.key === 'Enter')
            (event.preventDefault(),
              event.stopPropagation(),
              open ? (isTyping ? typedTime && closeList(true) : pickMinutes(activeMinutes)) : openList());
          else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if ((event.preventDefault(), !open)) {
              openList();
              return;
            }
            const index = options.indexOf(activeMinutes),
              next = options[Math.max(0, Math.min(options.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))];
            typeValue(rt(Math.floor(next / 60), next % 60));
          } else
            !isTyping &&
              !event.metaKey &&
              !event.ctrlKey &&
              !event.altKey &&
              (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') &&
              (event.preventDefault(), typeValue(event.key.length === 1 ? event.key : ''));
      },
      handleOpenChange = (nextOpen, details) => {
        if (nextOpen) {
          openList();
          return;
        }
        const target = details.event.target;
        if (target instanceof Node && anchorRef.current?.contains(target)) {
          details.cancel();
          return;
        }
        closeList(details.reason !== 'escape-key');
      },
      handleChange = event => typeValue(event.target.value),
      handlePaste = event => {
        (event.preventDefault(),
          isTyping && typedTime && (referenceMinutes.current = typedTime.hour * 60 + typedTime.minute),
          typeValue(event.clipboardData.getData('text')));
      },
      keepFocus = event => event.preventDefault(),
      hoverOption = minutes => () => setHoveredMinutes(minutes),
      clearHover = () => setHoveredMinutes(null),
      clickOption = minutes => () => pickMinutes(minutes);
    return (
      (0, c.useEffect)(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => {
          const list = listRef.current,
            option = list?.querySelector(`[data-time="${anchorMinutes}"]`);
          list && option && (list.scrollTop = option.offsetTop - list.clientHeight / 2 + option.offsetHeight / 2);
        });
        return () => cancelAnimationFrame(frame);
      }, [open, anchorMinutes]),
      (0, r.jsxs)(Ls, {
        open,
        onOpenChange: handleOpenChange,
        children: [
          (0, r.jsxs)('div', {
            ref: anchorRef,
            className: L('relative w-fit min-w-0', className),
            children: [
              (0, r.jsx)(De, {
                ref: inputRef,
                role: 'combobox',
                'aria-label': label,
                'aria-expanded': open,
                'aria-controls': open ? listId : void 0,
                'aria-haspopup': 'listbox',
                'aria-autocomplete': 'none',
                'aria-activedescendant': open ? `${listId}-${activeMinutes}` : void 0,
                'aria-invalid': isTyping && typedValue.length > 0 && !typedTime,
                autoComplete: 'off',
                readOnly: !isTyping,
                value: inputValue,
                className: L(
                  Ie({variant: 'ghost'}),
                  'text-foreground field-sizing-content w-auto max-w-full bg-transparent pr-7 font-normal shadow-none dark:bg-transparent',
                  isTyping ? 'cursor-text select-text' : 'cursor-default caret-transparent',
                ),
                onClick: openList,
                onChange: handleChange,
                onKeyDown: handleKeyDown,
                onPaste: handlePaste,
              }),
              (0, r.jsx)(ce, {className: 'text-muted-foreground pointer-events-none absolute top-2 right-2 size-4'}),
            ],
          }),
          (0, r.jsx)(Ks, {
            anchor: anchorRef,
            align: 'end',
            sideOffset: 4,
            initialFocus: false,
            finalFocus: false,
            className: 'w-40 p-1.5',
            children: (0, r.jsx)('div', {
              ref: listRef,
              id: listId,
              role: 'listbox',
              'aria-label': label,
              className: 'relative max-h-60 overflow-y-auto',
              children: options.map(minutes =>
                (0, r.jsxs)(
                  he,
                  {
                    id: `${listId}-${minutes}`,
                    'data-time': minutes,
                    role: 'option',
                    'aria-selected': minutes === currentMinutes,
                    type: 'button',
                    tabIndex: -1,
                    variant: 'ghost',
                    className: L(
                      'h-8 w-full justify-between font-normal',
                      activeMinutes === minutes && 'bg-accent text-accent-foreground',
                    ),
                    onPointerDown: keepFocus,
                    onPointerMove: hoverOption(minutes),
                    onPointerLeave: clearHover,
                    onClick: clickOption(minutes),
                    children: [
                      rt(Math.floor(minutes / 60), minutes % 60),
                      minutes === currentMinutes && (0, r.jsx)(Tn, {className: 'size-4'}),
                    ],
                  },
                  minutes,
                ),
              ),
            }),
          }),
        ],
      })
    );
  },
  /** Minutes as 9:05 AM. */
  rt = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${period}`;
  },
  /** A typed time; an hour with no AM or PM picks the next one after the reference time. */
  ln = (text, referenceMinutes) => {
    const match = /^(\d{1,4})(?::(\d{2}))?\s*([ap](?:m)?)?$/.exec(
      text
        .trim()
        .toLowerCase()
        .replace(/([ap])\.?m\.?$/, '$1m'),
    );
    if (!match) return null;
    const digits = match[1],
      period = match[3];
    if (match[2] && digits.length > 2) return null;
    let hour = Number(digits.length > 2 ? digits.slice(0, -2) : digits);
    const minute = Number(match[2] ?? (digits.length > 2 ? digits.slice(-2) : 0));
    if (minute > 59 || hour > (period ? 12 : 23) || (period && hour < 1)) return null;
    if (period) hour = (hour % 12) + (period.startsWith('p') ? 12 : 0);
    else if (hour >= 1 && hour <= 12 && !digits.startsWith('0')) {
      const base = hour % 12;
      hour = [base, base + 12].find(candidate => candidate * 60 + minute > referenceMinutes) ?? base;
    }
    return {hour, minute};
  },
  /** The default rule, 9 AM daily. */
  ko = 'FREQ=DAILY;BYHOUR=9;BYMINUTE=0',
  /** The Repeat choices. */
  cn = [
    {type: 'interval', label: 'Interval'},
    {type: 'daily', label: 'Daily'},
    {type: 'weekdays', label: 'Weekdays'},
    {type: 'weekly', label: 'Weekly'},
    {type: 'custom', label: 'Custom'},
  ],
  /** The week's days. */
  WEEK_DAYS = [
    {label: 'Monday', value: 'MO'},
    {label: 'Tuesday', value: 'TU'},
    {label: 'Wednesday', value: 'WE'},
    {label: 'Thursday', value: 'TH'},
    {label: 'Friday', value: 'FR'},
    {label: 'Saturday', value: 'SA'},
    {label: 'Sunday', value: 'SU'},
  ],
  /** A routine trigger as the fields' schedule. */
  parseSchedule = trigger => {
    const runAt = trigger.runAt ?? nextHour(trigger.timezone);
    if (trigger.scheduleKind === 'once') {
      const time = inTimezone(runAt, trigger.timezone);
      return {
        type: 'once',
        frequency: 'DAILY',
        interval: 1,
        structured: false,
        days: [],
        hour: time.hour(),
        minute: time.minute(),
        rrule: trigger.rrule || 'FREQ=DAILY;BYHOUR=9;BYMINUTE=0',
        runAt,
      };
    }
    const rrule = trigger.rrule || 'FREQ=DAILY;BYHOUR=9;BYMINUTE=0',
      parts = parseRruleParts(rrule),
      hour = Number(parts.BYHOUR?.match(/^\d+/)?.[0] ?? 9),
      minute = Number(parts.BYMINUTE?.match(/^\d+/)?.[0] ?? 0),
      days = parseDays(parts.BYDAY),
      interval = Number(parts.INTERVAL ?? 1),
      frequency = parts.FREQ === 'WEEKLY' ? 'WEEKLY' : 'DAILY',
      base = {days, hour, minute, rrule, runAt, interval, frequency};
    if (['MINUTELY', 'HOURLY'].includes(parts.FREQ) && hasOnlyParts(parts, ['FREQ', 'INTERVAL']))
      return {...base, type: 'interval', interval: interval * (parts.FREQ === 'HOURLY' ? 60 : 1), structured: true};
    const structured =
      ['DAILY', 'WEEKLY'].includes(parts.FREQ) &&
      hasFixedTime(parts) &&
      (!parts.BYDAY ||
        (parts.FREQ === 'WEEKLY' &&
          parts.BYDAY.split(',').every(time => WEEK_DAYS.some(weekDay => weekDay.value === time)))) &&
      hasOnlyParts(parts, ['FREQ', 'INTERVAL', 'BYDAY', 'BYHOUR', 'BYMINUTE', 'BYSECOND']);
    if (structured && isSingleInterval(parts.INTERVAL)) {
      const time = frequency === 'DAILY' ? 'daily' : days.join(',') === 'MO,TU,WE,TH,FR' ? 'weekdays' : 'weekly';
      return {...base, type: time, structured};
    }
    return {...base, type: 'custom', structured};
  },
  /** A schedule as a trigger. */
  triggerFromSchedule = (schedule, timezone) =>
    schedule.type === 'once'
      ? {scheduleKind: 'once', runAt: schedule.runAt ?? nextHour(timezone)}
      : {scheduleKind: 'recurring', rrule: schedule.rrule},
  /** The fields as an RRULE. */
  buildRrule = schedule => {
    const {type, hour, minute, interval, frequency, days} = schedule,
      dtstart = schedule.rrule.split(/\r?\n/).find(line => line.startsWith('DTSTART')),
      prefix =
        type === 'custom' && dtstart
          ? `${dtstart}
RRULE:`
          : '';
    if (type === 'interval') return `${prefix}FREQ=MINUTELY;INTERVAL=${interval}`;
    if (type === 'once' || !schedule.structured) return schedule.rrule;
    const ruleFrequency = type === 'custom' ? frequency : type === 'daily' ? 'DAILY' : 'WEEKLY',
      byDay = type === 'weekdays' ? 'MO,TU,WE,TH,FR' : sortDays(days).join(',');
    return `${prefix}FREQ=${ruleFrequency}${type === 'custom' ? `;INTERVAL=${interval}` : ''}${ruleFrequency === 'WEEKLY' ? `;BYDAY=${byDay}` : ''};BYHOUR=${hour};BYMINUTE=${minute}`;
  },
  /** Toggles a day; the last one stays. */
  toggleDay = (days, day) => {
    const selected = new Set(days);
    return (selected.has(day) && selected.size > 1 ? selected.delete(day) : selected.add(day), sortDays([...selected]));
  },
  /** Days as text. */
  formatDays = days => {
    const labels = days
      .map(day => WEEK_DAYS.find(entry => entry.value === day)?.label)
      .reduce((list, label) => (label && list.push(label), list), []);
    return days.join(',') === 'MO,TU,WE,TH,FR'
      ? 'Weekdays'
      : labels.length === 7
        ? 'Everyday'
        : new Intl.ListFormat('en', {style: 'long', type: 'conjunction'}).format(labels);
  },
  /** A time as a datetime-local value. */
  toDateTimeLocal = (value, timezone) => inTimezone(value, timezone).format('YYYY-MM-DDTHH:mm'),
  /** A datetime-local value as a time. */
  fromDateTimeLocal = (value, timezone) => {
    if (value)
      try {
        return pe.default.tz(value, timezone).toISOString();
      } catch {
        const parsed = (0, pe.default)(value);
        return parsed.isValid() ? parsed.toISOString() : void 0;
      }
  },
  /** A BYDAY value as days. */
  parseDays = value =>
    sortDays(
      value
        ?.split(',')
        .map(day => day.trim().toUpperCase())
        .filter(Boolean) ?? [],
    ),
  /** An RRULE's parts. */
  parseRruleParts = rrule =>
    Object.fromEntries(
      (rrule.split(/\r?\n/).find(part => part.startsWith('RRULE:')) ?? rrule)
        .replace(/^RRULE:/, '')
        .split(';')
        .map(part => part.split('=', 2))
        .filter(part => !!(part[0] && part[1]))
        .map(([part, value]) => [part.toUpperCase(), value.toUpperCase()]),
    ),
  /** Whether a part is a whole number. */
  isWholeNumber = value => !!(value && /^\d+$/.test(value)),
  /** Whether a rule repeats every period. */
  isSingleInterval = interval => !interval || interval === '1',
  /** Whether a rule has one fixed time. */
  hasFixedTime = parts =>
    isWholeNumber(parts.BYHOUR) && isWholeNumber(parts.BYMINUTE) && (!parts.BYSECOND || parts.BYSECOND === '0'),
  /** Whether a rule only has these parts. */
  hasOnlyParts = (parts, allowed) => Object.keys(parts).every(key => allowed.includes(key)),
  /** Days in week order, Monday when none. */
  sortDays = days => {
    const selected = new Set(days),
      ordered = WEEK_DAYS.map(day => day.value).filter(day => selected.has(day));
    return ordered.length ? ordered : ['MO'];
  },
  /** The next whole hour. */
  nextHour = timezone => inTimezone(new Date(), timezone).add(1, 'hour').startOf('hour').toISOString(),
  /** A time in a zone, or local when the zone is unknown. */
  inTimezone = (value, timezone) => {
    const date = (0, pe.default)(value);
    if (!date.isValid()) return (0, pe.default)();
    try {
      return date.tz(timezone);
    } catch {
      return date;
    }
  },
  /** The schedule fields. */
  Fo = () => {
    const form = Le(),
      trigger = form.watch('trigger'),
      timezone = form.watch('timezone'),
      [pickedType, setPickedType] = (0, c.useState)(null),
      scheduleKind = trigger.kind,
      rrule = trigger.kind === 'recurring' ? trigger.rrule : void 0,
      runAt = trigger.kind === 'once' ? trigger.runAt : void 0,
      parsed = parseSchedule({scheduleKind, rrule, runAt, timezone}),
      schedule = {...parsed, type: pickedType ?? parsed.type},
      isCustom = schedule.type === 'custom',
      showDays = schedule.type === 'weekly' || (isCustom && schedule.structured && schedule.frequency === 'WEEKLY'),
      showTime = schedule.type !== 'once' && schedule.type !== 'interval' && schedule.structured,
      setTrigger = value => {
        form.setValue(
          'trigger',
          value.scheduleKind === 'once' ? {kind: 'once', runAt: value.runAt} : {kind: 'recurring', rrule: value.rrule},
          {shouldDirty: true, shouldValidate: true},
        );
      },
      update = value => {
        setTrigger(triggerFromSchedule({...value, rrule: buildRrule(value)}, timezone));
      },
      selectType = value => {
        value &&
          (setPickedType(value),
          update({
            ...schedule,
            type: value,
            structured: true,
            interval: value === 'interval' ? 30 : 1,
            frequency: 'WEEKLY',
          }));
      },
      selectFrequency = value => {
        (value === 'DAILY' || value === 'WEEKLY') && update({...schedule, frequency: value});
      },
      changeInterval = value => {
        const label = Number(value.currentTarget.value);
        /^\d+$/.test(value.currentTarget.value) &&
          Number.isSafeInteger(label) &&
          label > 0 &&
          update({...schedule, interval: label});
      },
      restoreInterval = value => {
        value.currentTarget.value = String(schedule.interval);
      },
      setDays = value => update({...schedule, days: value}),
      setTime = value => update({...schedule, ...value}),
      setRunAt = value => {
        const label = fromDateTimeLocal(value.target.value, timezone);
        label && update({...schedule, runAt: label});
      },
      setRule = value => {
        (setPickedType('custom'), setTrigger({scheduleKind: 'recurring', rrule: value.target.value}));
      };
    return (0, r.jsxs)(Mn, {
      className: 'divide-border gap-0 divide-y',
      children: [
        (0, r.jsx)(ScheduleRow, {
          label: 'Repeat',
          children: (0, r.jsxs)(Ke, {
            items: cn.map(({type: value, label}) => ({value, label})),
            value: schedule.type === 'once' ? 'custom' : schedule.type,
            onValueChange: selectType,
            children: [
              (0, r.jsx)(Ue, {
                'aria-label': 'Repeat',
                icon: (0, r.jsx)(ce, {className: 'text-muted-foreground size-4'}),
                className: Ie({
                  variant: 'ghost',
                  shape: 'pill',
                  className: 'text-foreground -mr-1 w-fit bg-transparent font-normal shadow-none dark:bg-transparent',
                }),
                children: (0, r.jsx)(ut, {}),
              }),
              (0, r.jsx)(Ve, {
                align: 'end',
                className: 'w-44',
                children: cn.map(value => (0, r.jsx)(we, {value: value.type, children: value.label}, value.type)),
              }),
            ],
          }),
        }),
        isCustom &&
          schedule.structured &&
          (0, r.jsx)(ScheduleRow, {
            label: 'Repeats',
            children: (0, r.jsxs)(Ke, {
              items: {DAILY: 'Daily', WEEKLY: 'Weekly'},
              value: schedule.frequency,
              onValueChange: selectFrequency,
              children: [
                (0, r.jsx)(Ue, {
                  'aria-label': 'Repeats',
                  icon: (0, r.jsx)(ce, {className: 'text-muted-foreground size-4'}),
                  className: Ie({
                    variant: 'ghost',
                    shape: 'pill',
                    className: 'text-foreground -mr-1 w-fit bg-transparent font-normal shadow-none dark:bg-transparent',
                  }),
                  children: (0, r.jsx)(ut, {}),
                }),
                (0, r.jsxs)(Ve, {
                  align: 'end',
                  className: 'w-44',
                  children: [
                    (0, r.jsx)(we, {value: 'DAILY', children: 'Daily'}),
                    (0, r.jsx)(we, {value: 'WEEKLY', children: 'Weekly'}),
                  ],
                }),
              ],
            }),
          }),
        (schedule.type === 'interval' || (isCustom && schedule.structured)) &&
          (0, r.jsx)(ScheduleRow, {
            label: 'Every',
            children: (0, r.jsxs)('div', {
              className: 'flex items-center gap-2',
              children: [
                (0, r.jsx)(
                  De,
                  {
                    'aria-label': 'Repeat interval',
                    type: 'text',
                    inputMode: 'numeric',
                    pattern: '[0-9]+',
                    required: true,
                    defaultValue: schedule.interval,
                    className: 'field-sizing-content w-fit border-none bg-transparent! px-1 text-right shadow-none',
                    onChange: changeInterval,
                    onBlur: restoreInterval,
                  },
                  `${schedule.type}-${schedule.frequency}`,
                ),
                (0, r.jsx)('span', {
                  className: 'text-muted-foreground pr-3 text-sm select-none',
                  children:
                    schedule.type === 'interval'
                      ? 'minutes'
                      : `${schedule.frequency === 'WEEKLY' ? 'week' : 'day'}${schedule.interval === 1 ? '' : 's'}`,
                }),
              ],
            }),
          }),
        showDays &&
          (0, r.jsx)(ScheduleRow, {
            label: 'On',
            children: (0, r.jsx)(DaysPicker, {days: schedule.days, onValueChange: setDays}),
          }),
        showTime &&
          (0, r.jsx)(ScheduleRow, {
            label: isCustom ? 'Start time' : 'Time',
            children: (0, r.jsx)(TimeCombobox, {
              'aria-label': 'Routine time',
              hour: schedule.hour,
              minute: schedule.minute,
              onValueChange: setTime,
            }),
          }),
        schedule.type === 'once' &&
          (0, r.jsx)(ScheduleRow, {
            label: 'Run at',
            children: (0, r.jsx)(De, {
              'aria-label': 'Routine run time',
              type: 'datetime-local',
              className: 'w-fit',
              value: toDateTimeLocal(schedule.runAt, timezone),
              onChange: setRunAt,
            }),
          }),
        isCustom &&
          !schedule.structured &&
          (0, r.jsx)(ScheduleRow, {
            label: 'Rule',
            children: (0, r.jsx)(De, {
              'aria-label': 'Custom RRULE',
              className: 'min-w-0 flex-1',
              value: schedule.rrule,
              onChange: setRule,
            }),
          }),
      ],
    });
  },
  /** A schedule row. */
  ScheduleRow = ({label, children}) =>
    (0, r.jsxs)(ot, {
      orientation: 'horizontal',
      className: 'min-h-11 flex-row items-center justify-between gap-3 py-1.5 pr-2 pl-3',
      children: [(0, r.jsx)(it, {className: 'shrink-0 font-normal select-none', children: label}), children],
    }),
  /** The days menu. */
  DaysPicker = ({days, onValueChange}) => {
    const toggle = day => () => onValueChange(toggleDay(days, day));
    return (0, r.jsxs)(vt, {
      children: [
        (0, r.jsxs)(gt, {
          render: (0, r.jsx)(he, {
            type: 'button',
            variant: 'ghost',
            shape: 'pill',
            'aria-label': 'Repeat days',
            className: 'text-foreground -mr-1 w-fit min-w-0 font-normal',
          }),
          children: [
            (0, r.jsx)('span', {className: 'min-w-0 truncate', children: formatDays(days)}),
            (0, r.jsx)(ce, {className: 'size-3.5! opacity-50'}),
          ],
        }),
        (0, r.jsx)(xt, {
          align: 'end',
          className: 'w-44',
          children: (0, r.jsx)(be, {
            children: WEEK_DAYS.map(day =>
              (0, r.jsx)(
                jn,
                {
                  checked: days.includes(day.value),
                  closeOnClick: false,
                  onClick: toggle(day.value),
                  children: day.label,
                },
                day.value,
              ),
            ),
          }),
        }),
      ],
    });
  },
  /** The default model as a routine's model. */
  $o = () => {
    const {modelProvider, modelId, thinkingLevel, fastMode} = We();
    return (0, c.useMemo)(
      () => ({provider: modelProvider, modelId, thinkingLevel, fastMode}),
      [fastMode, modelId, modelProvider, thinkingLevel],
    );
  },
  /** The routines mutations. */
  Vo = () => {
    const trpc = Q(),
      queryClient = Re(),
      createRoutine = ne(trpc.routines.create.mutationOptions({onSuccess: invalidate})),
      updateRoutine = ne(trpc.routines.update.mutationOptions({onSuccess: invalidate})),
      deleteRoutine = ne(trpc.routines.delete.mutationOptions({onSuccess: invalidate})),
      runRoutine = ne(trpc.routines.runNow.mutationOptions({onSuccess: invalidate}));
    function invalidate() {
      return Promise.all([
        queryClient.invalidateQueries({queryKey: trpc.routines.pathKey()}),
        queryClient.invalidateQueries({queryKey: trpc.sessions.pathKey()}),
      ]);
    }
    return {createRoutine, updateRoutine, deleteRoutine, runRoutine};
  }
