const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const analyticsService = require('./analyticsService');

class ExportService {
    /**
     * Generate PDF report
     */
    async generatePDFReport(res, reportType = 'full', startDate = null, endDate = null) {
        const doc = new PDFDocument({ margin: 50 });

        // Pipe PDF to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-report-${Date.now()}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(24).text('LuxeThread Analytics Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        if (startDate && endDate) {
            doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, { align: 'center' });
        }
        doc.moveDown(2);

        // KPIs Section
        doc.fontSize(18).text('Key Performance Indicators', { underline: true });
        doc.moveDown();

        const kpis = await analyticsService.getKPIs(startDate, endDate);
        doc.fontSize(12);
        doc.text(`Total Revenue: €${kpis.totalRevenue}`);
        doc.text(`Total Orders: ${kpis.totalOrders}`);
        doc.text(`Average Order Value: €${kpis.averageOrderValue}`);
        doc.text(`New Customers: ${kpis.newCustomers}`);
        doc.text(`Total Products: ${kpis.totalProducts}`);
        doc.text(`Low Stock Products: ${kpis.lowStockProducts}`);
        doc.moveDown(2);

        // Top Products Section
        doc.fontSize(18).text('Top 10 Selling Products', { underline: true });
        doc.moveDown();

        const topProducts = await analyticsService.getTopProducts(10, startDate, endDate);
        doc.fontSize(10);

        topProducts.forEach((product, index) => {
            doc.text(`${index + 1}. ${product.name}`);
            doc.text(`   Quantity Sold: ${product.totalQuantity} | Revenue: €${product.totalRevenue.toFixed(2)}`, { indent: 20 });
            doc.moveDown(0.5);
        });
        doc.moveDown();

        // Cart Abandonment Section
        doc.fontSize(18).text('Cart Abandonment Analysis', { underline: true });
        doc.moveDown();

        const abandonment = await analyticsService.getCartAbandonment(startDate, endDate);
        doc.fontSize(12);
        doc.text(`Total Carts: ${abandonment.totalCarts}`);
        doc.text(`Abandoned Carts: ${abandonment.abandonedCarts}`);
        doc.text(`Abandonment Rate: ${abandonment.abandonmentRate}%`);
        doc.text(`Abandoned Value: €${abandonment.abandonedValue}`);
        doc.text(`Average Abandoned Value: €${abandonment.averageAbandonedValue}`);
        doc.moveDown(2);

        // Customer Segmentation Section
        doc.addPage();
        doc.fontSize(18).text('Customer Segmentation', { underline: true });
        doc.moveDown();

        const segmentation = await analyticsService.getCustomerSegmentation();
        doc.fontSize(12);
        doc.text(`Total Customers: ${segmentation.totalCustomers}`);
        doc.moveDown();

        Object.entries(segmentation.segments).forEach(([segment, data]) => {
            doc.fontSize(14).text(`${segment.charAt(0).toUpperCase() + segment.slice(1)}: ${data.count} customers`);
            doc.moveDown(0.5);
        });

        // Footer
        doc.fontSize(10).text('LuxeThread - Premium Fashion Analytics', 50, doc.page.height - 50, { align: 'center' });

        doc.end();
    }

    /**
     * Generate Excel report
     */
    async generateExcelReport(res, reportType = 'full', startDate = null, endDate = null) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'LuxeThread';
        workbook.created = new Date();

        // KPIs Sheet
        const kpisSheet = workbook.addWorksheet('KPIs');
        const kpis = await analyticsService.getKPIs(startDate, endDate);

        kpisSheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        kpisSheet.addRows([
            { metric: 'Total Revenue', value: `€${kpis.totalRevenue}` },
            { metric: 'Total Orders', value: kpis.totalOrders },
            { metric: 'Average Order Value', value: `€${kpis.averageOrderValue}` },
            { metric: 'New Customers', value: kpis.newCustomers },
            { metric: 'Total Products', value: kpis.totalProducts },
            { metric: 'Low Stock Products', value: kpis.lowStockProducts }
        ]);

        // Style header
        kpisSheet.getRow(1).font = { bold: true };
        kpisSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };

        // Top Products Sheet
        const productsSheet = workbook.addWorksheet('Top Products');
        const topProducts = await analyticsService.getTopProducts(10, startDate, endDate);

        productsSheet.columns = [
            { header: 'Rank', key: 'rank', width: 10 },
            { header: 'Product Name', key: 'name', width: 30 },
            { header: 'Quantity Sold', key: 'quantity', width: 15 },
            { header: 'Total Revenue', key: 'revenue', width: 15 },
            { header: 'Order Count', key: 'orders', width: 15 },
            { header: 'Avg Price', key: 'avgPrice', width: 15 }
        ];

        topProducts.forEach((product, index) => {
            productsSheet.addRow({
                rank: index + 1,
                name: product.name,
                quantity: product.totalQuantity,
                revenue: `€${product.totalRevenue.toFixed(2)}`,
                orders: product.orderCount,
                avgPrice: `€${product.averagePrice.toFixed(2)}`
            });
        });

        productsSheet.getRow(1).font = { bold: true };
        productsSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };

        // Cart Abandonment Sheet
        const abandonmentSheet = workbook.addWorksheet('Cart Abandonment');
        const abandonment = await analyticsService.getCartAbandonment(startDate, endDate);

        abandonmentSheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        abandonmentSheet.addRows([
            { metric: 'Total Carts', value: abandonment.totalCarts },
            { metric: 'Abandoned Carts', value: abandonment.abandonedCarts },
            { metric: 'Completed Orders', value: abandonment.completedOrders },
            { metric: 'Abandonment Rate', value: `${abandonment.abandonmentRate}%` },
            { metric: 'Abandoned Value', value: `€${abandonment.abandonedValue}` },
            { metric: 'Average Abandoned Value', value: `€${abandonment.averageAbandonedValue}` }
        ]);

        abandonmentSheet.getRow(1).font = { bold: true };
        abandonmentSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };

        // Customer Segmentation Sheet
        const segmentationSheet = workbook.addWorksheet('Customer Segmentation');
        const segmentation = await analyticsService.getCustomerSegmentation();

        segmentationSheet.columns = [
            { header: 'Segment', key: 'segment', width: 25 },
            { header: 'Count', key: 'count', width: 15 }
        ];

        Object.entries(segmentation.segments).forEach(([segment, data]) => {
            segmentationSheet.addRow({
                segment: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/([A-Z])/g, ' $1'),
                count: data.count
            });
        });

        segmentationSheet.getRow(1).font = { bold: true };
        segmentationSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };

        // Write to response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-report-${Date.now()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    }
}

module.exports = new ExportService();
