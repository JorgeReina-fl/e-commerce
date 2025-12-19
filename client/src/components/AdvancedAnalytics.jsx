import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, DollarSign, ShoppingCart, Users, Download, ArrowUpRight, ArrowDownRight, BarChart3, PieChart as PieChartIcon, Activity, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

// Hook para detectar tema oscuro
const useTheme = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkTheme();

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isDark;
};

// Paletas de colores adaptativas
const getChartColors = (isDark) => ({
    // Colores principales
    primary: isDark ? '#F5F5F5' : '#171717',
    secondary: isDark ? '#A3A3A3' : '#525252',
    muted: isDark ? '#525252' : '#D4D4D4',

    // Área/líneas
    areaStroke: isDark ? '#22C55E' : '#16A34A',
    areaFill: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(22, 163, 74, 0.12)',
    lineAccent: isDark ? '#FBBF24' : '#D97706',

    // Grid
    grid: isDark ? '#404040' : '#E5E5E5',

    // Barras
    bar: isDark ? '#60A5FA' : '#2563EB',
    barHover: isDark ? '#93C5FD' : '#1D4ED8',

    // Pie chart - tonos que funcionan en ambos temas
    pie: isDark
        ? ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA']
        : ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED'],

    // Tooltip
    tooltipBg: isDark ? '#171717' : '#FFFFFF',
    tooltipText: isDark ? '#F5F5F5' : '#171717',
    tooltipBorder: isDark ? '#404040' : '#E5E5E5',
});

// Tooltip personalizado adaptativo
const CustomTooltip = ({ active, payload, label, isDark }) => {
    const colors = getChartColors(isDark);

    if (active && payload && payload.length) {
        return (
            <div
                className="px-4 py-3 shadow-lg border"
                style={{
                    backgroundColor: colors.tooltipBg,
                    borderColor: colors.tooltipBorder
                }}
            >
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: colors.secondary }}>
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span style={{ color: colors.secondary }}>{entry.name}:</span>
                        <span className="font-semibold tabular-nums" style={{ color: colors.primary }}>
                            {typeof entry.value === 'number'
                                ? entry.value.toLocaleString('es-ES')
                                : entry.value}
                            {entry.name.includes('€') || entry.name.includes('Ingreso') ? '€' : ''}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// KPI Card con iconos descriptivos
const KPICard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue', isDark }) => {
    const isPositive = trend === 'up';
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

    const bgColors = {
        blue: isDark ? 'bg-primary-light/500/10' : 'bg-primary-light/50',
        green: isDark ? 'bg-green-500/10' : 'bg-green-50',
        purple: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
        orange: isDark ? 'bg-orange-500/10' : 'bg-orange-50',
    };

    const iconColors = {
        blue: isDark ? 'text-primary' : 'text-primary',
        green: isDark ? 'text-green-400' : 'text-green-600',
        purple: isDark ? 'text-purple-400' : 'text-purple-600',
        orange: isDark ? 'text-orange-400' : 'text-orange-600',
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 rounded-lg">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${bgColors[color]}`}>
                    <Icon size={20} className={iconColors[color]} strokeWidth={1.5} />
                </div>
                {trendValue !== undefined && (
                    <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded ${isPositive
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                        <TrendIcon size={12} />
                        <span>{trendValue}%</span>
                    </div>
                )}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                {title}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tabular-nums">
                {value}
            </p>
            {subtitle && (
                <p className="text-xs text-neutral-400 mt-1.5">{subtitle}</p>
            )}
        </div>
    );
};

// Chart Card con header mejorado
const ChartCard = ({ title, subtitle, icon: Icon, children, className = '' }) => (
    <div className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden ${className}`}>
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
            {Icon && (
                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <Icon size={16} className="text-neutral-600 dark:text-neutral-400" strokeWidth={1.5} />
                </div>
            )}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
                )}
            </div>
        </div>
        <div className="p-4 sm:p-6">
            {children}
        </div>
    </div>
);

// Stat Row mejorado
const StatRow = ({ label, value, highlight = false, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
        <div className="flex items-center gap-2">
            {Icon && <Icon size={14} className={highlight ? 'text-red-500' : 'text-neutral-400'} />}
            <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
        </div>
        <span className={`text-sm font-semibold tabular-nums ${highlight
            ? 'text-red-500 dark:text-red-400'
            : 'text-neutral-900 dark:text-white'
            }`}>
            {value}
        </span>
    </div>
);

const AdvancedAnalytics = () => {
    const { t } = useTranslation();
    const { token } = useAuth();
    const isDark = useTheme();
    const colors = getChartColors(isDark);

    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [abandonment, setAbandonment] = useState(null);
    const [segmentation, setSegmentation] = useState(null);
    const [revenueTrends, setRevenueTrends] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchAllAnalytics();
    }, []);

    const fetchAllAnalytics = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const params = dateRange.start && dateRange.end
                ? `?startDate=${dateRange.start}&endDate=${dateRange.end}`
                : '';

            const [kpisRes, productsRes, abandonmentRes, segmentationRes, trendsRes] = await Promise.all([
                axios.get(`${API_URL}/analytics/kpis${params}`, config),
                axios.get(`${API_URL}/analytics/top-products${params}`, config),
                axios.get(`${API_URL}/analytics/cart-abandonment${params}`, config),
                axios.get(`${API_URL}/analytics/customer-segmentation`, config),
                axios.get(`${API_URL}/analytics/revenue-trends?period=day&limit=30`, config)
            ]);

            setKpis(kpisRes.data);
            setTopProducts(productsRes.data);
            setAbandonment(abandonmentRes.data);
            setSegmentation(segmentationRes.data);
            setRevenueTrends(trendsRes.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const params = dateRange.start && dateRange.end
                ? `?startDate=${dateRange.start}&endDate=${dateRange.end}`
                : '';

            const response = await axios.get(
                `${API_URL}/analytics/export/${format}${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(t('common.success'));
        } catch (error) {
            console.error('Export error:', error);
            toast.error(t('common.error'));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-neutral-200 dark:border-neutral-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-neutral-500">{t('analytics.loading')}</p>
                </div>
            </div>
        );
    }

    const segmentationData = segmentation ? Object.entries(segmentation.segments).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        value: value.count
    })) : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                        {t('analytics.dashboard')}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        {t('analytics.businessOverview')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                    >
                        <Download size={14} strokeWidth={2} />
                        PDF
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                    >
                        <Download size={14} strokeWidth={2} />
                        Excel
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t('analytics.totalRevenue')}
                    value={`€${(kpis?.totalRevenue || 0).toLocaleString('es-ES')}`}
                    icon={DollarSign}
                    color="green"
                    trend="up"
                    trendValue={12}
                    isDark={isDark}
                />
                <KPICard
                    title={t('analytics.totalOrders')}
                    value={(kpis?.totalOrders || 0).toLocaleString()}
                    icon={ShoppingCart}
                    color="blue"
                    trend="up"
                    trendValue={8}
                    isDark={isDark}
                />
                <KPICard
                    title={t('analytics.avgOrderValue')}
                    value={`€${(kpis?.averageOrderValue || 0).toFixed(2)}`}
                    icon={TrendingUp}
                    color="purple"
                    trend="up"
                    trendValue={3}
                    isDark={isDark}
                />
                <KPICard
                    title={t('analytics.newCustomers')}
                    value={(kpis?.newCustomers || 0).toLocaleString()}
                    subtitle={t('analytics.thisPeriod')}
                    icon={Users}
                    color="orange"
                    trend="down"
                    trendValue={2}
                    isDark={isDark}
                />
            </div>

            {/* Revenue Trends - Área con gradiente */}
            <ChartCard
                title={t('analytics.revenueTrend')}
                subtitle={t('analytics.last30Days')}
                icon={Activity}
            >
                <div className="mb-4 flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.areaStroke }} />
                        <span className="text-neutral-600 dark:text-neutral-400">{t('analytics.revenue')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.lineAccent }} />
                        <span className="text-neutral-600 dark:text-neutral-400">{t('analytics.orders')}</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={revenueTrends}>
                        <defs>
                            <linearGradient id={`areaGradient-${isDark ? 'dark' : 'light'}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colors.areaStroke} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={colors.areaStroke} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                        <XAxis
                            dataKey="period"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: colors.secondary }}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="revenue"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: colors.secondary }}
                            tickFormatter={(value) => `€${value}`}
                        />
                        <YAxis
                            yAxisId="orders"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: colors.secondary }}
                        />
                        <Tooltip content={<CustomTooltip isDark={isDark} />} />
                        <Area
                            yAxisId="revenue"
                            type="monotone"
                            dataKey="revenue"
                            stroke={colors.areaStroke}
                            strokeWidth={2}
                            fill={`url(#areaGradient-${isDark ? 'dark' : 'light'})`}
                            name={t('analytics.revenue')}
                        />
                        <Line
                            yAxisId="orders"
                            type="monotone"
                            dataKey="orders"
                            stroke={colors.lineAccent}
                            strokeWidth={2}
                            dot={{ fill: colors.lineAccent, r: 3 }}
                            activeDot={{ r: 5 }}
                            name={t('analytics.orders')}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Top Products - Barras horizontales */}
            <ChartCard
                title={t('analytics.topProducts')}
                subtitle={t('analytics.bestPerforming')}
                icon={BarChart3}
            >
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                        data={topProducts.slice(0, 6)}
                        layout="vertical"
                        margin={{ left: 0, right: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={true} vertical={false} />
                        <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: colors.secondary }}
                            tickFormatter={(value) => `€${value}`}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: colors.primary }}
                            width={100}
                        />
                        <Tooltip content={<CustomTooltip isDark={isDark} />} />
                        <Bar
                            dataKey="totalRevenue"
                            fill={colors.bar}
                            radius={[0, 4, 4, 0]}
                            name={t('analytics.revenue')}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cart Abandonment */}
                <ChartCard
                    title={t('analytics.cartAbandonment')}
                    subtitle={t('analytics.recoveryOpportunity')}
                    icon={AlertTriangle}
                >
                    <div className="space-y-0">
                        <StatRow label={t('analytics.totalCarts')} value={abandonment?.totalCarts || 0} />
                        <StatRow label={t('analytics.abandonedCarts')} value={abandonment?.abandonedCarts || 0} highlight icon={ShoppingCart} />
                        <StatRow label={t('analytics.abandonmentRate')} value={`${abandonment?.abandonmentRate || 0}%`} highlight />
                        <StatRow label={t('analytics.abandonedValue')} value={`€${(abandonment?.abandonedValue || 0).toLocaleString('es-ES')}`} />
                        <StatRow label={t('analytics.avgAbandonedValue')} value={`€${(abandonment?.averageAbandonedValue || 0).toFixed(2)}`} />
                    </div>
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/20">
                        <p className="text-sm text-green-800 dark:text-green-400">
                            💡 {t('analytics.potentialRecovery')}: <span className="font-bold">€{((abandonment?.abandonedValue || 0) * 0.3).toFixed(2)}</span>
                        </p>
                    </div>
                </ChartCard>

                {/* Customer Segmentation - Pie mejorado */}
                <ChartCard
                    title={t('analytics.customerSegments')}
                    subtitle={t('analytics.userComposition')}
                    icon={PieChartIcon}
                >
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={segmentationData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {segmentationData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={colors.pie[index % colors.pie.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip isDark={isDark} />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend horizontal */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        {segmentationData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colors.pie[index % colors.pie.length] }}
                                />
                                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                    {entry.name}
                                </span>
                                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                    {entry.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>
        </div>
    );
};

export default AdvancedAnalytics;


