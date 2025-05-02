"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GetDashboardDataResponse } from "@/services/dashboard/types";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts";

type DashboardChartsProps = {
  data: GetDashboardDataResponse;
};

export function DashboardCharts({ data }: DashboardChartsProps) {
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const monthlySales = data.sales_by_month.map((item) => ({
    month: item.month,
    quantity: item.monthly_total_items_sold,
    profit: item.monthly_total_sales_value,
  }));

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>Number of sales throughout the year</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs className="w-full" defaultValue="barras">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="barras">Bar Chart</TabsTrigger>
              <TabsTrigger value="linha">Line Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="barras">
              <ChartContainer config={chartConfig}>
                <BarChart data={monthlySales}>
                  <XAxis axisLine={false} tickLine={false} dataKey="month" />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="quantity"
                    name="Sales"
                    fill="#6366f1"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="linha">
              <ChartContainer config={chartConfig}>
                <LineChart data={monthlySales}>
                  <XAxis axisLine={false} tickLine={false} dataKey="month" />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    type="monotone"
                    dataKey="quantity"
                    name="Sales"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Profit</CardTitle>
          <CardDescription>Total profit per month (in $)</CardDescription>
        </CardHeader>
        <CardContent className="h-full">
          <ChartContainer className="h-full max-w-[95%]" config={chartConfig}>
            <LineChart className="h-full" data={monthlySales}>
              <XAxis axisLine={false} tickLine={false} dataKey="month" />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$ ${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                type="monotone"
                name="Profit"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Sales vs Profit Comparison</CardTitle>
          <CardDescription>
            Relationship between quantity sold and profit generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              data={monthlySales}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis axisLine={false} tickLine={false} dataKey="month" />
              <YAxis
                axisLine={false}
                tickLine={false}
                yAxisId="left"
                orientation="left"
                stroke="#6366f1"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                tickFormatter={(value) => `$ ${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                yAxisId="left"
                dataKey="quantity"
                name="Quantity"
                fill="#6366f1"
                radius={4}
              />
              <Bar
                yAxisId="right"
                dataKey="profit"
                name="Profit"
                fill="#10b981"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
