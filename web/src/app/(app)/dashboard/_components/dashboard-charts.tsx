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
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export function DashboardCharts() {
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

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Vendas Mensais</CardTitle>
          <CardDescription>
            Quantidade de vendas ao longo do ano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs className="w-full" defaultValue="barras">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="barras">Barras</TabsTrigger>
              <TabsTrigger value="linha">Linha</TabsTrigger>
            </TabsList>
            <TabsContent value="barras">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[]}>
                    <XAxis axisLine={false} tickLine={false} dataKey="name" />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="vendas"
                      name="Vendas"
                      fill="#6366f1"
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="linha">
              <ChartContainer config={chartConfig}>
                <LineChart data={[]}>
                  <XAxis axisLine={false} tickLine={false} dataKey="name" />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    type="monotone"
                    dataKey="vendas"
                    name="Vendas"
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
          <CardTitle>Lucro Mensal</CardTitle>
          <CardDescription>Lucro total por mês (em R$)</CardDescription>
        </CardHeader>
        <CardContent className="h-full">
          <ChartContainer className="h-full max-w-[95%]" config={chartConfig}>
            <LineChart className="h-full" data={[]}>
              <XAxis axisLine={false} tickLine={false} dataKey="name" />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                type="monotone"
                name="Lucro"
                dataKey="lucro"
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
          <CardTitle>Comparativo de Vendas vs Lucro</CardTitle>
          <CardDescription>
            Relação entre quantidade vendida e lucro gerado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              data={[]}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis axisLine={false} tickLine={false} dataKey="name" />
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
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                yAxisId="left"
                dataKey="vendas"
                name="Quantidade"
                fill="#6366f1"
                radius={4}
              />
              <Bar
                yAxisId="right"
                dataKey="lucro"
                name="Lucro"
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
