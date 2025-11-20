"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarIcon,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  Globe2,
  Hash,
  RefreshCcw,
} from "lucide-react";
import { DateTime } from "luxon";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const timezoneList =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [
        "UTC",
        "America/New_York",
        "Europe/London",
        "Europe/Paris",
        "Asia/Shanghai",
        "Asia/Tokyo",
      ];

const formatters = [
  { label: "Short Time", code: "t", format: (dt: DateTime) => dt.toFormat("HH:mm") },
  { label: "Long Time", code: "T", format: (dt: DateTime) => dt.toFormat("HH:mm:ss") },
  { label: "Short Date", code: "d", format: (dt: DateTime) => dt.toFormat("MM/dd/yyyy") },
  { label: "Long Date", code: "D", format: (dt: DateTime) => dt.toFormat("EEEE, LLLL d, yyyy") },
  { label: "Short Date & Time", code: "f", format: (dt: DateTime) => dt.toFormat("LLLL d, yyyy HH:mm") },
  { label: "Long Date & Time", code: "F", format: (dt: DateTime) => dt.toFormat("EEEE, LLLL d, yyyy HH:mm") },
];

const howToUseSteps: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Pick a date and time",
    description: "Use the calendar and clock inputs to match your event start.",
    icon: CalendarIcon,
  },
  {
    title: "Select a timezone",
    description: "Search for any IANA timezone so Discord renders correctly for everyone.",
    icon: Globe2,
  },
  {
    title: "Copy the code",
    description: "Copy the chat-friendly timestamp or UNIX seconds and paste it into Discord.",
    icon: Copy,
  },
];

const faqItems = [
  {
    question: "How do I create a timestamp in Discord?",
    answer:
      "Generate a UNIX timestamp from the date, time, and timezone you pick above. Copy the syntax like <t:1704067200:F> and paste it in chat.",
  },
  {
    question: "How do I add a timestamp to a Discord message?",
    answer:
      "Paste the copied <t:UNIX:FORMAT> code directly into your message. Discord renders it automatically when you send.",
  },
  {
    question: "How do I show local time for everyone?",
    answer:
      "Choose the timezone that matches your event. Discord converts the timestamp to each viewer's local time after you send it.",
  },
  {
    question: "Which format should I pick?",
    answer:
      "t, T, d, D, f, and F are absolute formats; R shows relative text like “in 5 minutes.” The table above previews each option.",
  },
  {
    question: "How do I display a countdown like 'in 10 minutes'?",
    answer:
      "Use the Relative format (code R). Copy the generated <t:UNIX:R> snippet to show human-friendly countdown text.",
  },
  {
    question: "Can I convert times without changing my system clock?",
    answer:
      "Yes. Set the exact timezone in the dropdown, preview the result, and copy the code—no device settings required.",
  },
];

function getInitialTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>(getInitialTime());
  const [timeZone, setTimeZone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [copiedValue, setCopiedValue] = useState<string>("");
  const [relativeBase, setRelativeBase] = useState<DateTime | null>(null);
  const [timezoneQuery, setTimezoneQuery] = useState<string>("");
  const timezoneSearchRef = useRef<HTMLInputElement>(null);
  const [openQuestion, setOpenQuestion] = useState<string>(faqItems[0]?.question ?? "");

  const targetDateTime = useMemo(() => {
    if (!date) return null;

    const [hours, minutes] = time.split(":").map((part) => Number(part));

    return DateTime.fromObject(
      {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: Number.isFinite(hours) ? hours : 0,
        minute: Number.isFinite(minutes) ? minutes : 0,
      },
      { zone: timeZone || "UTC" }
    );
  }, [date, time, timeZone]);

  useEffect(() => {
    setRelativeBase(DateTime.now());
  }, [targetDateTime]);

  const filteredTimezones = useMemo(() => {
    const query = timezoneQuery.trim().toLowerCase();

    if (!query) return timezoneList;

    return timezoneList.filter((zone) => zone.toLowerCase().includes(query));
  }, [timezoneQuery]);

  const unixSeconds = targetDateTime?.toSeconds() ?? 0;
  const timestamp = Math.floor(unixSeconds);
  const relativeTime = useMemo(() => {
    if (!targetDateTime || !relativeBase) return "-";

    return targetDateTime.toRelative({ base: relativeBase }) ?? "-";
  }, [relativeBase, targetDateTime]);

  const items = useMemo(() => {
    if (!targetDateTime) return [];

    return [
      ...formatters.map((item) => ({
        label: item.label,
        code: item.code,
        example: item.format(targetDateTime),
      })),
      { label: "Relative", code: "R", example: relativeTime },
      { label: "UNIX Timestamp", code: "", example: String(timestamp) },
    ];
  }, [targetDateTime, relativeTime, timestamp]);

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(""), 1500);
    } catch (error) {
      console.error("Unable to copy", error);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow">
            <Clock3 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Discord Timestamp Generator</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">Timestamp Generator</h1>
          <p className="text-muted-foreground">
            Convert any date and time into Discord-friendly timestamp codes with timezone aware previews.
          </p>
        </div>

        <Card className="border-none bg-white shadow-md">
          <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Date and Time</CardTitle>
              <CardDescription>Select when your event starts and how it should appear in chat.</CardDescription>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[220px] justify-start bg-white text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? targetDateTime?.toFormat("DDD") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selected) => setDate(selected)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Time</Label>
                <div className="relative">
                  <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="w-[160px] bg-white pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timezone</Label>
                <Select
                  value={timeZone}
                  onValueChange={setTimeZone}
                  onOpenChange={(open) => {
                    if (!open) setTimezoneQuery("");
                  }}
                >
                  <SelectTrigger className="w-[220px] bg-white">
                    <Globe2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-[280px] overflow-y-auto p-0"
                    onOpenAutoFocus={(event) => {
                      event.preventDefault();
                      timezoneSearchRef.current?.focus();
                    }}
                  >
                    <div className="sticky top-0 z-10 border-b bg-white p-2">
                      <Input
                        placeholder="Search timezones"
                        value={timezoneQuery}
                        onChange={(event) => setTimezoneQuery(event.target.value)}
                        ref={timezoneSearchRef}
                        className="h-9"
                      />
                    </div>

                    <div className="py-1">
                      {filteredTimezones.length ? (
                        filteredTimezones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No timezones found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="grid grid-cols-1 gap-3 border-b p-4 text-sm font-medium text-muted-foreground sm:grid-cols-3">
                <span className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" /> Chat Syntax
                </span>
                <span>Example Result</span>
                <span className="text-right">Action</span>
              </div>

              <div className="divide-y">
                {items.map((item) => {
                  const syntax = item.code ? `<t:${timestamp}:${item.code}>` : item.example;
                  const isCopied = copiedValue === syntax;
                  return (
                    <div
                      key={item.label}
                      className="grid grid-cols-1 items-center gap-3 px-4 py-3 sm:grid-cols-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {item.code || "unix"}
                        </span>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium text-gray-900">{item.label}</span>
                          <span className="text-muted-foreground">{item.code ? syntax : "Seconds since epoch"}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-900 sm:text-base">{item.example}</div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => copyToClipboard(syntax)}
                        >
                          <Copy className="h-4 w-4" />
                          {isCopied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                <span>
                  Timestamps are generated from your selected date, time, and timezone. Copy the syntax to use in Discord.
                </span>
              </div>
              <Button variant="ghost" className="text-primary" onClick={() => setDate(new Date())}>
                Reset to now
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">How to Use</h2>
            </div>
            <div className="space-y-4">
              {howToUseSteps.map((step) => (
                <div key={step.title} className="flex gap-3 rounded-lg bg-muted/60 p-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <CircleHelp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">FAQ</h2>
            </div>
            <div className="space-y-4">
              {faqItems.map((item) => {
                const isOpen = openQuestion === item.question;
                return (
                  <div
                    key={item.question}
                    className={cn(
                      "overflow-hidden rounded-xl border transition data-[state=open]:bg-white",
                      "border-blue-100 bg-white/80 dark:border-gray-700", // dark mode-friendly classes if theme is extended
                      isOpen && "bg-white"
                    )}
                    data-state={isOpen ? "open" : "closed"}
                  >
                    <h3>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-900",
                          "transition [&[data-state=open]>svg]:rotate-180"
                        )}
                        aria-expanded={isOpen}
                        onClick={() => setOpenQuestion(isOpen ? "" : item.question)}
                        data-state={isOpen ? "open" : "closed"}
                      >
                        <span className="pr-3 text-base">{item.question}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                      </button>
                    </h3>
                    <div
                      className={cn(
                        "overflow-hidden text-sm text-muted-foreground transition-all",
                        isOpen ? "max-h-40 px-4 pb-4" : "max-h-0 px-4"
                      )}
                      aria-hidden={!isOpen}
                    >
                      <p>{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
