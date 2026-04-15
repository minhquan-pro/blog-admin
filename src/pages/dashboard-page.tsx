/**
 * Dashboard phân tích — lựa chọn biểu đồ (điểm UI / UX / BI, tối đa 15 mỗi loại):
 * KPI 15 | Line/area 15 | Bar 14 | H-bar 14 | Donut 11 | Stacked 11 | Combo 11 | Funnel 10 |
 * Heatmap 11 | Scatter 10. Triển khai v1: KPI, line, bar, horizontal bar, donut (tag).
 */
import { useEffect, useMemo, useState } from "react";

import { fetchAdminDashboard } from "@/lib/api";
import type { AdminDashboard, PostStatus } from "@/types/domain";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DAY_OPTIONS: { value: 7 | 30 | 90; label: string }[] = [
  { value: 7, label: "7 ngày" },
  { value: 30, label: "30 ngày" },
  { value: 90, label: "90 ngày" },
];

const STATUS_LABEL: Record<PostStatus, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  unlisted: "Không niêm yết",
  archived: "Lưu trữ",
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatInt(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function DashboardPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    setError(null);
    void fetchAdminDashboard({ days })
      .then((d) => {
        if (!c) setData(d);
      })
      .catch((e: unknown) => {
        if (!c) setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
      });
    return () => {
      c = true;
    };
  }, [days]);

  const statusRows = useMemo(() => {
    if (!data) return [];
    return (Object.keys(data.postsByStatus) as PostStatus[]).map((key) => ({
      name: STATUS_LABEL[key],
      value: data.postsByStatus[key],
    }));
  }, [data]);

  const tagPie = useMemo(() => {
    if (!data?.topTags.length) return [];
    return data.topTags.slice(0, 5).map((t) => ({
      name: t.name,
      value: t.postCount,
    }));
  }, [data]);

  const topPostsH = useMemo(() => {
    if (!data?.topPosts.length) return [];
    return data.topPosts.map((p) => ({
      title:
        p.title.length > 42 ? `${p.title.slice(0, 40)}…` : p.title,
      claps: p.clapCount,
      responses: p.responseCount,
    }));
  }, [data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Theo dõi tăng trưởng nội dung, người dùng và tương tác để ưu tiên phát triển blog.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Khoảng thời gian</span>
          <select
            className={cn(
              "rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            )}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) as 7 | 30 | 90)}
          >
            {DAY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!data && !error && (
        <p className="text-sm text-muted-foreground">Đang tải số liệu…</p>
      )}

      {data && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard label="Người dùng" value={data.totals.users} />
            <KpiCard label="Bài đã xuất bản" value={data.totals.postsPublished} />
            <KpiCard label="Bình luận" value={data.totals.comments} />
            <KpiCard label="Bookmark" value={data.totals.bookmarks} />
            <KpiCard label="Tổng clap" value={data.totals.claps} />
            <KpiCard label="Bài (chưa xóa)" value={data.totals.posts} />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Xu hướng theo ngày</CardTitle>
                <CardDescription>
                  Bài xuất bản, người dùng mới và bình luận trong {data.days} ngày gần nhất.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--border)",
                      }}
                      labelFormatter={(l) => `Ngày ${l}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="publishedPosts"
                      name="Bài xuất bản"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      name="User mới"
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="comments"
                      name="Bình luận"
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bài theo trạng thái</CardTitle>
                <CardDescription>Phân bổ trong các bài chưa xóa mềm.</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <Bar dataKey="value" name="Số bài" radius={[4, 4, 0, 0]}>
                      {statusRows.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top bài theo clap</CardTitle>
                <CardDescription>Ưu tiên nội dung thu hút tương tác.</CardDescription>
              </CardHeader>
              <CardContent className="h-[360px] pt-2">
                {topPostsH.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topPostsH}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="title"
                        width={130}
                        tick={{ fontSize: 10 }}
                        interval={0}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--border)",
                        }}
                      />
                      <Bar dataKey="claps" name="Clap" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top tag (5)</CardTitle>
                <CardDescription>Tỷ lệ số bài gắn tag trong nhóm tag nhiều bài nhất.</CardDescription>
              </CardHeader>
              <CardContent className="h-[360px] pt-2">
                {tagPie.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có tag đủ dữ liệu.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tagPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={96}
                        paddingAngle={2}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {tagPie.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--border)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-display text-2xl tabular-nums">
          {formatInt(value)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
