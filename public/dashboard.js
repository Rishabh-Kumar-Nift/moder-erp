// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard initialized");
    
    // Initialize all dashboard components
    initializeDashboard();
    
    // Set up auto-refresh every 60 seconds
    setInterval(refreshDashboard, 60000);
    
    // Add scroll detection for table shadows
    const tableContainer = document.querySelector('.table-responsive');
    if (tableContainer) {
        tableContainer.addEventListener('scroll', handleTableScroll);
        // Initial check
        handleTableScroll({ target: tableContainer });
    }
});

// Handle table scroll for shadow indicators
function handleTableScroll(event) {
    const container = event.target;
    const isScrollStart = container.scrollLeft <= 5;
    const isScrollEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;
    
    container.classList.toggle('scroll-start', isScrollStart);
    container.classList.toggle('scroll-end', isScrollEnd);
}

// Main dashboard initialization
function initializeDashboard() {
    // Load required data
    fetchStatistics();
    fetchProcurementData();
    
    // Initialize charts
    initializeCharts();
    
    
    // Initialize unified tracking table
    initializeUnifiedTracking();
}

// Refresh all dashboard data
function refreshDashboard() {
    fetchStatistics();
    fetchProcurementData();
    fetchUnifiedTrackingData(null, null, searchTerm);
    
    // Refresh charts
    updateCharts();
}

// Fetch and update statistics
function fetchStatistics() {
    const token = localStorage.getItem('token');
    
    // Fetch styles count
    fetch('http://localhost:5001/api/dashboard/styles/count', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const element = document.getElementById('total-styles');
        if (element) {
            element.textContent = data.totalStyles || 0;
        } else {
            console.warn('Element #total-styles not found in DOM');
        }
    })
    .catch(error => console.error('Error fetching styles count:', error.message));
    
    // Fetch BOM items count
    fetch('http://localhost:5001/api/dashboard/bom/count', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const element = document.getElementById('total-bom-items');
        if (element) {
            element.textContent = data.totalBOMItems || 0;
        } else {
            console.warn('Element #total-bom-items not found in DOM');
        }
    })
    .catch(error => console.error('Error fetching BOM count:', error.message));
    
    // Fetch unique buyers count
    fetch('http://localhost:5001/api/dashboard/styles/buyers/count', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const element = document.getElementById('total-buyers');
        if (element) {
            element.textContent = data.totalBuyers || 0;
        } else {
            console.warn('Element #total-buyers not found in DOM');
        }
    })
    .catch(error => console.error('Error fetching buyers count:', error.message));
    
    // Fetch unique material types count
    fetch('http://localhost:5001/api/dashboard/bom/material-types/count', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const element = document.getElementById('total-material-types');
        if (element) {
            element.textContent = data.totalMaterialTypes || 0;
        } else {
            console.warn('Element #total-material-types not found in DOM');
        }
    })
    .catch(error => console.error('Error fetching material types count:', error.message));
    
    // Fetch data for charts
    fetch('http://localhost:5001/api/dashboard/charts-data', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        updateStylesByBuyerChart(data.stylesByBuyer);
        updateMaterialTypeChart(data.materialTypes);
    })
    .catch(error => console.error('Error fetching chart data:', error.message));
}

// Initialize charts
function initializeCharts() {
    // Styles by Sample Type Chart
    const buyerCtx = document.getElementById('styles-by-buyer-chart').getContext('2d');
window.buyerChart = new Chart(buyerCtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Number of Styles',
            data: [],
            backgroundColor: [
                'rgba(63, 81, 181, 0.8)',
                'rgba(33, 150, 243, 0.8)',
                'rgba(76, 175, 80, 0.8)',
                'rgba(255, 152, 0, 0.8)',
                'rgba(244, 67, 54, 0.8)'
            ],
            borderWidth: 1,
            borderColor: [
                'rgb(63, 81, 181)',
                'rgb(33, 150, 243)',
                'rgb(76, 175, 80)',
                'rgb(255, 152, 0)',
                'rgb(244, 67, 54)'
            ]
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                bottom: 15 // Add padding at the bottom for labels
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: 10,
                titleFont: { size: 14 },
                bodyFont: { size: 13 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 }
            },
            x: {
                ticks: {
                    autoSkip: false, // Prevent automatic skipping of labels
                    maxRotation: 45, // Rotate labels to save space
                    minRotation: 45, // Rotate labels to save space
                    font: {
                        size: 11 // Smaller font size for labels
                    }
                }
            }
        }
    }
});
    
    // Material Type Chart
    const materialCtx = document.getElementById('material-type-chart').getContext('2d');
    window.materialChart = new Chart(materialCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0',
                    '#3f51b5', '#e91e63', '#009688', '#ffeb3b', '#795548'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Add this function to wrap chart elements properly
function wrapChartsInProperContainers() {
    // For each chart container
    document.querySelectorAll('.chart-container').forEach(container => {
        const canvas = container.querySelector('canvas');
        
        // Only proceed if there's no wrapper already and there is a canvas
        if (canvas && !container.querySelector('.chart-canvas-container')) {
            // Create a wrapper div for the canvas
            const wrapper = document.createElement('div');
            wrapper.className = 'chart-canvas-container';
            
            // Replace the canvas with the wrapper containing the canvas
            canvas.parentNode.insertBefore(wrapper, canvas);
            wrapper.appendChild(canvas);
        }
    });
}

// Modify the initializeCharts function to use better responsive options
function enhanceChartOptions() {
    // For the bar chart
    if (window.buyerChart) {
        window.buyerChart.options.maintainAspectRatio = false;
        window.buyerChart.options.responsive = true;
        window.buyerChart.options.layout.padding = {
            left: 10,
            right: 10,
            top: 20,
            bottom: 20
        };
        window.buyerChart.update();
    }
    
    // For the doughnut chart
    if (window.materialChart) {
        window.materialChart.options.maintainAspectRatio = false;
        window.materialChart.options.responsive = true;
        
        // Adjust legend options for better fit
        window.materialChart.options.plugins.legend = {
            position: 'right',
            align: 'center',
            labels: {
                boxWidth: 12,
                font: {
                    size: 11
                },
                padding: 10
            }
        };
        
        // Add padding for better spacing
        window.materialChart.options.layout = {
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        };
        
        window.materialChart.update();
    }
}

// This function will apply the fixes after charts are initialized
function applyChartFixes() {
    // First wrap the canvases in proper containers
    wrapChartsInProperContainers();
    
    // Then adjust chart options
    enhanceChartOptions();
}

// Code to run when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a short time after page load to ensure charts are initialized
    setTimeout(applyChartFixes, 500);
    
    // Also apply fixes when window resizes for better responsiveness
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyChartFixes, 250);
    });
});

// Replace the updateStylesByBuyerChart function with this improved version
function updateStylesByBuyerChart(data) {
    if (window.buyerChart) {
        // Create a standardized version of the data
        let standardizedData = data.map(item => {
            let standardItem = {...item};
            if (standardItem.category && standardItem.category.includes('Sample')) {
                standardItem.category = standardItem.category.replace(' Sample', '');
            }
            return standardItem;
        });
        
        // Define the sample types we want to display in a specific order
        const sampleTypes = ['Proto', 'Fit', 'PP', 'Shipment', 'Counter'];
        
        // Create arrays for labels and data
        let chartLabels = [];
        let chartData = [];
        
        // Process each sample type in order to ensure they appear consistently
        sampleTypes.forEach(type => {
            // Find the matching data item
            const item = standardizedData.find(d => 
                d.category === type || 
                d.category === `${type} Sample`
            );
            
            if (item) {
                chartLabels.push(type);
                chartData.push(item.count);
            } else {
                // If no data exists for this type, add it with zero count
                // This ensures all expected categories are present
                chartLabels.push(type);
                chartData.push(0);
            }
        });
        
        // Add any additional categories not in our predefined list
        standardizedData.forEach(item => {
            const standardType = item.category.replace(' Sample', '');
            if (!sampleTypes.includes(standardType) && !chartLabels.includes(standardType)) {
                chartLabels.push(standardType);
                chartData.push(item.count);
            }
        });
        
        // Update the chart with new data
        window.buyerChart.data.labels = chartLabels;
        window.buyerChart.data.datasets[0].data = chartData;
        
        // Enhanced tooltip configuration
        window.buyerChart.options.plugins.tooltip = {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: 10,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            callbacks: {
                label: function(context) {
                    const value = context.parsed.y;
                    return `Number of Styles: ${value}`;
                }
            }
        };
        
        window.buyerChart.update();
    }
}

// Update material type chart with new data
function updateMaterialTypeChart(data) {
    if (window.materialChart) {
        window.materialChart.data.labels = data.map(item => item.materialType);
        window.materialChart.data.datasets[0].data = data.map(item => item.count);
        window.materialChart.update();
    }
}

// Update all charts
function updateCharts() {
    if (window.buyerChart) {
        window.buyerChart.update();
    }
    if (window.materialChart) {
        window.materialChart.update();
    }
}

// Fetch procurement data
function fetchProcurementData() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:5001/api/dashboard/procurement-status', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // Use the new update functions
        updateFabricStatus(data.fabric);
        updateAccessoriesStatus(data.accessories);
    })
    .catch(error => {
        console.error('Error fetching procurement status:', error);
    });
    
    fetch('http://localhost:5001/api/dashboard/upcoming-deliveries', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // Update with status field if not present
        const fabricDeliveries = data.fabric.map(item => ({
            ...item,
            status: item.status || getRandomStatus() // Add a status if not present
        }));
        
        const accessoriesDeliveries = data.accessories.map(item => ({
            ...item,
            status: item.status || getRandomStatus() // Add a status if not present
        }));
        
        // Use the new update functions
        updateFabricTimeline(fabricDeliveries);
        updateAccessoriesTimeline(accessoriesDeliveries);
    })
    .catch(error => {
        console.error('Error fetching upcoming deliveries:', error);
    });
}

// Helper to generate random status (temporary until your API provides this)
function getRandomStatus() {
    const statuses = ['Processing', 'Shipped', 'In Transit', 'Delayed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
}

// Update Fabric Status
function updateFabricStatus(data) {
    document.getElementById('fabric-pending-pr').textContent = data.pendingPR || 0;
    document.getElementById('fabric-pending-po').textContent = data.pendingPO || 0;
    document.getElementById('fabric-in-delivery').textContent = data.inDelivery || 0;
    
    const total = data.total || 1;
    const completed = data.completed || 0;
    const percentage = Math.min(100, Math.round((completed / total) * 100));
    
    document.getElementById('fabric-progress').style.width = `${percentage}%`;
    document.getElementById('fabric-progress-text').textContent = `${percentage}%`;
}

// Update Accessories Status
function updateAccessoriesStatus(data) {
    document.getElementById('acc-pending-pr').textContent = data.pendingPR || 0;
    document.getElementById('acc-pending-po').textContent = data.pendingPO || 0;
    document.getElementById('acc-in-delivery').textContent = data.inDelivery || 0;
    
    const total = data.total || 1;
    const completed = data.completed || 0;
    const percentage = Math.min(100, Math.round((completed / total) * 100));
    
    document.getElementById('acc-progress').style.width = `${percentage}%`;
    document.getElementById('acc-progress-text').textContent = `${percentage}%`;
}

// Update Accessories Timeline
function updateAccessoriesTimeline(deliveries) {
    const timeline = document.getElementById('accessories-timeline');
    if (!timeline) return;

    if (!deliveries || deliveries.length === 0) {
        timeline.innerHTML = '<div class="timeline-empty">No upcoming accessories deliveries</div>';
        return;
    }

    timeline.innerHTML = '';

    const deliveriesByDate = groupByDate(deliveries);
    const today = new Date().toLocaleDateString();

    Object.keys(deliveriesByDate).forEach(date => {
        const items = deliveriesByDate[date];
        const isPast = new Date(date) < new Date(today);
        const dateClass = date === today ? 'today' : isPast ? 'overdue' : '';

        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.style.borderLeftColor = date === today ? '#3b82f6' : isPast ? '#ef4444' : '#10b981';

        let deliveryItems = '';
        items.forEach(item => {
            deliveryItems += `
                <div class="delivery-item">
                    <div class="delivery-info">
                        <span class="delivery-name">${item.accessory_name}</span>
                        <span class="delivery-qty">${item.quantity} ${item.unit || 'pcs'}</span>
                    </div>
                    <div class="delivery-supplier">${item.vendor_name || 'Unknown Vendor'}</div>
                </div>
            `;
        });

        timelineItem.innerHTML = `
            <div class="timeline-date ${dateClass}">
                <span class="date-text">${formatDate(date)}</span>
            </div>
            <div class="timeline-content">
                ${deliveryItems}
            </div>
        `;

        timeline.appendChild(timelineItem);
    });
}

// Helper function to group deliveries by date
function groupByDate(deliveries) {
    const grouped = {};
    
    deliveries.forEach(delivery => {
        const date = new Date(delivery.expected_delivery_date).toLocaleDateString();
        
        if (!grouped[date]) {
            grouped[date] = [];
        }
        
        grouped[date].push(delivery);
    });
    
    return Object.keys(grouped)
        .sort((a, b) => new Date(a) - new Date(b))
        .reduce((result, key) => {
            result[key] = grouped[key];
            return result;
        }, {});
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Update Fabric Timeline
function updateFabricTimeline(deliveries) {
    const timeline = document.getElementById('fabric-timeline');
    if (!timeline) return;

    if (!deliveries || deliveries.length === 0) {
        timeline.innerHTML = '<div class="timeline-empty">No upcoming fabric deliveries</div>';
        return;
    }

    timeline.innerHTML = '';

    const deliveriesByDate = groupByDate(deliveries);
    const today = new Date().toLocaleDateString();

    Object.keys(deliveriesByDate).forEach(date => {
        const items = deliveriesByDate[date];
        const isPast = new Date(date) < new Date(today);
        const dateClass = date === today ? 'today' : isPast ? 'overdue' : '';

        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.style.borderLeftColor = date === today ? '#3b82f6' : isPast ? '#ef4444' : '#10b981';

        let deliveryItems = '';
        items.forEach(item => {
            deliveryItems += `
                <div class="delivery-item">
                    <div class="delivery-info">
                        <span class="delivery-name">${item.fabric_type}</span>
                        <span class="delivery-qty">${item.quantity} ${item.unit}</span>
                    </div>
                    <div class="delivery-supplier">${item.supplier_name || 'Unknown Supplier'}</div>
                </div>
            `;
        });

        timelineItem.innerHTML = `
            <div class="timeline-date ${dateClass}">
                <span class="date-text">${formatDate(date)}</span>
            </div>
            <div class="timeline-content">
                ${deliveryItems}
            </div>
        `;

        timeline.appendChild(timelineItem);
    });
}

// ----------------------
// UNIFIED TRACKING FUNCTIONALITY
// ----------------------

// Global variables for pagination
let currentPage = 1;
let totalPages = 1;
let itemsPerPage = 10;
let allTrackingData = [];
let filteredTrackingData = [];
let searchTerm = '';

// Handle search input
function handleSearchInput(event) {
    searchTerm = event.target.value.trim().toLowerCase();
    applySearchFilter();
}

// Apply search filter to tracking data
function applySearchFilter() {
    if (searchTerm) {
        filteredTrackingData = allTrackingData.filter(item => 
            (item.style_id && item.style_id.toString().toLowerCase().includes(searchTerm)) ||
            (item.style_number && item.style_number.toLowerCase().includes(searchTerm)) ||
            (item.style_name && item.style_name.toLowerCase().includes(searchTerm))
        );
    } else {
        filteredTrackingData = allTrackingData;
    }
    
    currentPage = 1;
    totalPages = Math.ceil(filteredTrackingData.length / itemsPerPage);
    
    updateUnifiedTrackingTable(getCurrentPageData());
    updatePaginationControls();
}

// Initialize unified tracking
function initializeUnifiedTracking() {
    console.log("Initializing unified tracking");
    
    populateBuyerFilter();
    
    // Set up multi-select dropdowns
    setupMultiSelect('sample-type');
    setupMultiSelect('buyer');
    
    // Event listeners for filter buttons
    document.getElementById('apply-filters').addEventListener('click', applyTrackingFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);

    // Set up search functionality
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', handleSearchInput);
    } else {
        console.warn('Search bar element not found in DOM');
    }
    
    fetchUnifiedTrackingData();
}

// Set up multi-select dropdown functionality
function setupMultiSelect(type) {
    const toggle = document.getElementById(`${type}-toggle`);
    const dropdown = document.getElementById(`${type}-dropdown`);
    const tagsContainer = document.getElementById(`${type}-tags`);
    
    toggle.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
    });
    
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    dropdown.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            updateSelectedTags(type);
        }
    });
}

// Update selected tags display
function updateSelectedTags(type) {
    const tagsContainer = document.getElementById(`${type}-tags`);
    const checkboxes = document.querySelectorAll(`#${type}-dropdown input[name="${type}"]:checked`);
    const selectedText = document.querySelector(`#${type}-toggle .selected-text`);
    
    tagsContainer.innerHTML = '';
    const selectedValues = [];
    
    checkboxes.forEach(checkbox => {
        const value = checkbox.value;
        selectedValues.push(value);
        
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `
            ${value}
            <span class="remove-tag" data-value="${value}" data-type="${type}">×</span>
        `;
        tagsContainer.appendChild(tag);
    });
    
    selectedText.textContent = selectedValues.length > 0 
        ? `${selectedValues.length} selected`
        : `Select ${type === 'sample-type' ? 'Sample Types' : 'Buyers'}`;
    
    document.querySelectorAll(`#${type}-tags .remove-tag`).forEach(tag => {
        tag.addEventListener('click', () => {
            const value = tag.dataset.value;
            const checkbox = document.querySelector(`#${type}-dropdown input[value="${value}"]`);
            checkbox.checked = false;
            updateSelectedTags(type);
        });
    });
}

// Populate buyer filter dropdown
function populateBuyerFilter() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:5001/api/dashboard/buyers', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const buyerOptions = document.getElementById('buyer-options');
        if (!buyerOptions) {
            console.error("Buyer options container not found!");
            return;
        }
        
        buyerOptions.innerHTML = '';
        
        (data.buyers || []).forEach(buyer => {
            if (buyer) {
                const option = document.createElement('label');
                option.className = 'multi-select-option';
                option.innerHTML = `
                    <input type="checkbox" value="${buyer}" name="buyer">
                    ${buyer}
                `;
                buyerOptions.appendChild(option);
            }
        });
    })
    .catch(error => console.error('Error loading buyers for filter:', error));
}

// Apply filters to tracking data
function applyTrackingFilters() {
    const sampleTypes = Array.from(
        document.querySelectorAll('#sample-type-dropdown input[name="sample-type"]:checked')
    ).map(cb => cb.value);
    
    const buyers = Array.from(
        document.querySelectorAll('#buyer-dropdown input[name="buyer"]:checked')
    ).map(cb => cb.value);
    
    currentPage = 1;
    
    fetchUnifiedTrackingData(sampleTypes, buyers, searchTerm);
}

// Clear all filters
function clearFilters() {
    document.querySelectorAll('#sample-type-dropdown input[name="sample-type"]').forEach(cb => {
        cb.checked = false;
    });
    
    document.querySelectorAll('#buyer-dropdown input[name="buyer"]').forEach(cb => {
        cb.checked = false;
    });
    
    updateSelectedTags('sample-type');
    updateSelectedTags('buyer');

    searchTerm = '';
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.value = '';
    }
    
    currentPage = 1;
    fetchUnifiedTrackingData([], [], '');
}

// Fetch unified tracking data
function fetchUnifiedTrackingData(sampleTypes = [], buyers = [], search = '') {
    console.log("Fetching unified tracking data with filters:", { sampleTypes, buyers, search });
    const token = localStorage.getItem('token');
    let url = 'http://localhost:5001/api/dashboard/unified-tracking';
    
    const params = [];
    if (sampleTypes.length > 0) {
        params.push(`sampleTypes=${encodeURIComponent(sampleTypes.join(','))}`);
    }
    if (buyers.length > 0) {
        params.push(`buyers=${encodeURIComponent(buyers.join(','))}`);
    }
    
    if (params.length > 0) {
        url += `?${params.join('&')}`;
    }
    
    console.log("Fetching from URL:", url);

    const tableBody = document.getElementById('unified-tracking-table');
    if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="12" class="empty-message"><i class="fas fa-circle-notch fa-spin"></i> Loading data...</td></tr>`;
    }

    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Received unified tracking data:", data);
        
        allTrackingData = data;
searchTerm = search;

applySearchFilter();
    })
    .catch(error => {
        console.error('Error fetching unified tracking data:', error);
        const tableBody = document.getElementById('unified-tracking-table');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="12" class="empty-message">Error loading tracking data: ${error.message}</td></tr>`;
        }
        document.getElementById('pagination-controls')?.remove();
    });
}

// Get data for the current page
function getCurrentPageData() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTrackingData.slice(startIndex, endIndex);
}

// Navigate to a specific page
function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    
    updateUnifiedTrackingTable(getCurrentPageData());
    
    updatePaginationControls();
    
    document.querySelector('.unified-tracking-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update pagination controls
function updatePaginationControls() {
    const existingPagination = document.getElementById('pagination-controls');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    if (totalPages <= 1) return;
    
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-controls';
    paginationContainer.className = 'pagination-controls';
    
    const pageInfo = document.createElement('div');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${filteredTrackingData.length} entries)`;
    
    const pageButtons = document.createElement('div');
    pageButtons.className = 'page-buttons';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'page-button';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => goToPage(currentPage - 1));
    
    const nextButton = document.createElement('button');
    nextButton.className = 'page-button';
    nextButton.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => goToPage(currentPage + 1));
    
    pageButtons.appendChild(prevButton);
    pageButtons.appendChild(nextButton);
    
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(pageButtons);
    
    const tableContainer = document.querySelector('.table-responsive');
    if (tableContainer) {
        tableContainer.parentNode.insertBefore(paginationContainer, tableContainer.nextSibling);
    }
}

// Update the unified tracking table
function updateUnifiedTrackingTable(trackingData) {
    const tableBody = document.getElementById('unified-tracking-table');
    if (!tableBody) {
        console.error("Unified tracking table body not found!");
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (!trackingData || trackingData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="12" class="empty-message">No styles found matching the criteria</td></tr>';
        return;
    }
    
    console.log(`Updating unified tracking table with ${trackingData.length} entries`);
    
    trackingData.forEach(item => {
        const row = document.createElement('tr');
        const bomStatus = getBomStatus(item);
        const prStatus = getPrStatus(item);
        const poStatus = getPoStatus(item);
        const grnStatus = getGrnStatus(item);
        const overallStatus = getStatusClass(item.procurement_status);
        
        row.innerHTML = `
    <td>${highlightMatch(item.style_id?.toString(), searchTerm) || 'N/A'}</td>
    <td>${highlightMatch(item.style_number, searchTerm) || 'N/A'}</td>
    <td>${highlightMatch(item.style_name, searchTerm) || 'N/A'}</td>
    <td>${item.buyer_name || 'N/A'}</td>
    <td>${item.sample_type || 'N/A'}</td>
    <td class="${bomStatus.class}">${bomStatus.text}</td>
    <td class="${prStatus.class}">${prStatus.text}</td>
    <td class="${poStatus.class}">${poStatus.text}</td>
    <td class="${grnStatus.class}">${grnStatus.text}</td>
    <td class="${overallStatus}">${item.procurement_status}</td>
    <td>${item.created_by || 'N/A'}</td>
    <td>
        <button class="view-details-button" data-id="${item.style_id}">
            <i class="fas fa-eye"></i> Details
        </button>
    </td>
`;
        
        tableBody.appendChild(row);
    });
    
    document.querySelectorAll('.view-details-button').forEach(button => {
        button.addEventListener('click', () => viewStyleDetails(button.dataset.id));
    });
    
    initTooltips();
}

// Initialize tooltips for table cells with truncated content
function initTooltips() {
    const cells = document.querySelectorAll('.tracking-table td');
    cells.forEach(cell => {
        if (cell.offsetWidth < cell.scrollWidth) {
            cell.setAttribute('title', cell.textContent);
            cell.classList.add('has-tooltip');
        }
    });
}

// Add here
function highlightMatch(text, term) {
    if (!term || !text) return text || '';
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Helper functions for status formatting
function getBomStatus(item) {
    if (item.bom_items_count > 0) {
        return {
            text: `${item.bom_items_count} items`,
            class: 'status-complete'
        };
    } else {
        return {
            text: 'Not started',
            class: 'status-pending'
        };
    }
}

function getPrStatus(item) {
    if (item.prf_count > 0 || item.pra_count > 0) {
        const parts = [];
        if (item.prf_count > 0) parts.push(`Fabric: ${item.fabric_colors || 'N/A'}`);
        if (item.pra_count > 0) parts.push(`Acc: ${item.accessory_colors || 'N/A'}`);
        return {
            text: parts.join(', '),
            class: 'status-complete'
        };
    } else {
        return {
            text: 'Not started',
            class: 'status-pending'
        };
    }
}

function getPoStatus(item) {
    if (item.pof_count > 0 || item.poa_count > 0) {
        const parts = [];
        if (item.pof_count > 0) parts.push(`Fabric: ${item.fabric_approval_status || 'N/A'}`);
        if (item.poa_count > 0) parts.push(`Acc: ${item.accessories_approval_status || 'N/A'}`);
        let statusClass = 'status-in-progress';
        if ((item.fabric_approval_status && item.fabric_approval_status.includes('Approved')) || 
            (item.accessories_approval_status && item.accessories_approval_status.includes('Approved'))) {
            statusClass = 'status-complete';
        }
        return {
            text: parts.join(', '),
            class: statusClass
        };
    } else {
        return {
            text: 'Not started',
            class: 'status-pending'
        };
    }
}

function getGrnStatus(item) {
    if (item.grn_count > 0) {
        return {
            text: `${item.grn_count} received`,
            class: 'status-complete'
        };
    } else {
        return {
            text: 'Not received',
            class: 'status-pending'
        };
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Completed':
            return 'status-complete';
        case 'GRN Pending':
        case 'PO Approval Pending':
            return 'status-in-progress';
        case 'BOM Pending':
        case 'PR Pending':
        case 'PO Pending':
            return 'status-pending';
        default:
            return '';
    }
}

// View style details - Show a modal with all the information
function viewStyleDetails(styleId) {
    console.log(`Viewing details for style ID: ${styleId}`);
    const token = localStorage.getItem('token');
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'modal-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-circle-notch fa-spin fa-3x"></i>
            <p>Loading style details...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    fetch(`http://localhost:5001/api/dashboard/style-detail/${styleId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Received style detail data:", data);
        document.body.removeChild(loadingOverlay);
        
        if (data && data.style) {
            const combinedData = {
                id: styleId,
                ...data.style,
                bom: data.bom || [],
                prFabric: data.prFabric || [],
                prAccessories: data.prAccessories || [],
                poFabric: data.poFabric || [],
                poAccessories: data.poAccessories || [],
                grn: data.grn || [],
                procurement_status: calculateProcurementStatus(data)
            };
            console.log("Combined data:", combinedData);
            showDetailsModal(combinedData);
        } else {
            alert('Style details not found.');
        }
    })
    .catch(error => {
        console.error('Error fetching style details:', error);
        document.body.removeChild(loadingOverlay);
        alert('Error loading style details. Please try again.');
    });
}

// Helper function to calculate procurement status
function calculateProcurementStatus(data) {
    if (data.bom.length === 0) return 'BOM Pending';
    if (data.prFabric.length === 0 && data.prAccessories.length === 0) return 'PR Pending';
    if (data.poFabric.length === 0 && data.poAccessories.length === 0) return 'PO Pending';
    
    const hasPendingPO = data.poFabric.some(po => po.approval_status === 'Pending') || 
                        data.poAccessories.some(po => po.approval_status === 'Pending');
    if (hasPendingPO) return 'PO Approval Pending';
    
    if (data.grn.length === 0) return 'GRN Pending';
    return 'Completed';
}

// Create and show a modal with comprehensive style details
function showDetailsModal(styleData) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#ffffff';
    modalContent.style.color = '#1f2937';
    modalContent.style.maxWidth = '800px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.setAttribute('aria-label', 'Close modal');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '1.5rem';
    closeButton.style.color = '#1f2937';
    closeButton.addEventListener('click', () => {
        modalOverlay.classList.add('fade-out');
        setTimeout(() => document.body.removeChild(modalOverlay), 300);
    });
    
    function formatFullDate(date) {
        return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    }
    
    const expectedDate = styleData.expected_completion_date 
        ? formatFullDate(styleData.expected_completion_date)
        : 'Not set';
    const createdDate = styleData.created_at 
        ? formatFullDate(styleData.created_at)
        : 'Unknown';
    
    // BOM Details Boxes
    let bomDetailsHTML = styleData.bom.length > 0 ? `
        <div class="details-boxes">
            ${styleData.bom.map((item, index) => `
                <div class="detail-card" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <h4 style="font-weight: 600; margin-bottom: 12px;">BOM Entry ${index + 1}</h4>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Material Type:</span>
                        <span>${item.material_type || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Description:</span>
                        <span>${item.material_description || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Quantity Required:</span>
                        <span>${item.quantity_required || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Unit:</span>
                        <span>${item.unit || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Sourcing Location:</span>
                        <span>${item.sourcing_location || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Created At:</span>
                        <span>${formatFullDate(item.created_at)}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<div style="color: #6b7280; padding: 16px;">No BOM entries created for this style yet.</div>';

    // PR Fabric Details Boxes
    let prFabricDetailsHTML = styleData.prFabric.length > 0 ? `
        <div class="details-boxes">
            ${styleData.prFabric.map((item, index) => `
                <div class="detail-card" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <h4 style="font-weight: 600; margin-bottom: 12px;">PR Fabric Entry ${index + 1}</h4>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Fabric Type:</span>
                        <span>${item.fabric_type || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Composition:</span>
                        <span>${item.composition || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Color:</span>
                        <span>${item.color || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">GSM:</span>
                        <span>${item.gsm || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Quantity:</span>
                        <span>${item.required_quantity || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Unit:</span>
                        <span>${item.unit || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Expected Delivery:</span>
                        <span>${formatFullDate(item.expected_delivery_date)}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Remarks:</span>
                        <span>${item.remarks || 'N/A'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<div style="color: #6b7280; padding: 16px;">No Fabric PR entries created for this style yet.</div>';

    // PR Accessories Details Boxes
    let prAccessoriesDetailsHTML = styleData.prAccessories.length > 0 ? `
        <div class="details-boxes">
            ${styleData.prAccessories.map((item, index) => `
                <div class="detail-card" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <h4 style="font-weight: 600; margin-bottom: 12px;">PR Accessories Entry ${index + 1}</h4>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Accessory Name:</span>
                        <span>${item.accessory_name || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Color:</span>
                        <span>${item.colors || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Quantity:</span>
                        <span>${item.required_quantity || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Priority:</span>
                        <span>${item.priority_status || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Expected Delivery:</span>
                        <span>${formatFullDate(item.expected_delivery_date)}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Remarks:</span>
                        <span>${item.remarks || 'N/A'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<div style="color: #6b7280; padding: 16px;">No Accessories PR entries created for this style yet.</div>';

    // PO Fabric Details Boxes
    let poFabricDetailsHTML = styleData.poFabric.length > 0 ? `
        <div class="details-boxes">
            ${styleData.poFabric.map((item, index) => `
                <div class="detail-card" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <h4 style="font-weight: 600; margin-bottom: 12px;">PO Fabric Entry ${index + 1}</h4>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">PO Number:</span>
                        <span>${item.po_number || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">PR Fabric ID:</span>
                        <span>${item.pr_fabric_id || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Fabric Type:</span>
                        <span>${item.fabric_type || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Supplier Name:</span>
                        <span>${item.supplier_name || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Quantity:</span>
                        <span>${item.finalized_quantity || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Price per Unit:</span>
                        <span>₹${item.cost_per_unit ? Number(item.cost_per_unit).toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Total Cost:</span>
                        <span>₹${item.cost_per_unit && item.finalized_quantity ? (item.cost_per_unit * item.finalized_quantity).toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Expected Delivery:</span>
                        <span>${formatFullDate(item.expected_delivery_date)}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Approval Status:</span>
                        <span style="color: ${item.approval_status === 'Approved' ? '#10b981' : item.approval_status === 'Rejected' ? '#ef4444' : '#f59e0b'}">${item.approval_status || 'N/A'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<div style="color: #6b7280; padding: 16px;">No Fabric PO entries created for this style yet.</div>';

    // PO Accessories Details Boxes
    let poAccessoriesDetailsHTML = styleData.poAccessories.length > 0 ? `
        <div class="details-boxes">
            ${styleData.poAccessories.map((item, index) => `
                <div class="detail-card" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <h4 style="font-weight: 600; margin-bottom: 12px;">PO Accessories Entry ${index + 1}</h4>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">PO Number:</span>
                        <span>${item.po_number || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">PR Accessory ID:</span>
                        <span>${item.pr_accessory_id || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Accessory Type:</span>
                        <span>${item.accessories_type || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Vendor Details:</span>
                        <span>${item.vendor_details || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Quantity:</span>
                        <span>${item.finalized_quantity || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Price per Unit:</span>
                        <span>₹${item.price_per_unit ? Number(item.price_per_unit).toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Total Cost:</span>
                        <span>₹${item.price_per_unit && item.finalized_quantity ? (item.price_per_unit * item.finalized_quantity).toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Expected Delivery:</span>
                        <span>${formatFullDate(item.expected_delivery_date)}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Approval Status:</span>
                        <span style="color: ${item.approval_status === 'Approved' ? '#10b981' : item.approval_status === 'Rejected' ? '#ef4444' : '#f59e0b'}">${item.approval_status || 'N/A'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<div style="color: #6b7280; padding: 16px;">No Accessories PO entries created for this style yet.</div>';

    // GRN Details Boxes
    let grnDetailsHTML = styleData.grn.length > 0 ? `
        <div class="details-boxes">
            ${styleData.grn.map((item, index) => `
                <div class="detail-card" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <h4 style="font-weight: 600; margin-bottom: 12px;">GRN Entry ${index + 1}</h4>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">GRN Number:</span>
                        <span>${item.grn_number || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Item Type:</span>
                        <span>${item.item_type || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Item Name:</span>
                        <span>${item.item_name || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Received Quantity:</span>
                        <span>${item.received_quantity || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Inspection Status:</span>
                        <span style="color: ${item.inspection_status === 'Passed' ? '#10b981' : item.inspection_status === 'Failed' ? '#ef4444' : '#6b7280'}">${item.inspection_status || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Supplier:</span>
                        <span>${item.supplier || 'N/A'}</span>
                    </div>
                    <div class="detail-field">
                        <span style="font-weight: 500; width: 150px;">Created At:</span>
                        <span>${formatFullDate(item.created_at)}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<div style="color: #6b7280; padding: 16px;">No GRN entries created for this style yet.</div>';

    // Build modal content
    modalContent.innerHTML = `
        <div class="modal-header" style="padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="font-size: 1.5rem; font-weight: 700; color:rgb(137, 9, 151);">Style Details: ${styleData.style_number || 'N/A'}</h2>
                    <p style="font-size: 0.875rem; color:rgb(19, 19, 20); margin-top: 4px;">${styleData.style_name || 'N/A'}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; background-color: #f3f4f6; padding: 4px 12px; border-radius: 9999px;">
                    <i class="fas fa-fingerprint" style="color:rgb(54, 56, 58);"></i>
                    <span style="font-size: 0.875rem; color: #1f2937;">ID: ${styleData.id || styleData.style_id || 'N/A'}</span>
                </div>
            </div>
        </div>
        <div class="modal-body" style="padding: 16px 0;">
            <div class="accordion">
                <!-- Basic Information -->
                <div class="accordion-item" style="margin-bottom: 16px;">
                    <button class="accordion-header" style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left;">
                        <span style="font-size: 1.125rem; font-weight: 500; color: #1f2937;"><i class="fas fa-info-circle" style="margin-right: 8px;"></i> Basic Information</span>
                        <i class="fas fa-chevron-down accordion-icon" style="color: #1f2937;"></i>
                    </button>
                    <div class="accordion-content hidden" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;">
                        <div style="display: grid; gap: 12px;">
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <i class="fas fa-hashtag" style="color: #6b7280;"></i>
                                <div>
                                    <span style="font-weight: 500; color: #1f2937;">Style ID:</span>
                                    <span style="color: #1f2937;">${styleData.id || styleData.style_id || 'N/A'}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <i class="fas fa-hashtag" style="color: #6b7280;"></i>
                                <div>
                                    <span style="font-weight: 500; color: #1f2937;">Style Number:</span>
                                    <span style="color: #1f2937;">${styleData.style_number || 'N/A'}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <i class="fas fa-tag" style="color: #6b7280;"></i>
                                <div>
                                    <span style="font-weight: 500; color: #1f2937;">Style Name:</span>
                                    <span style="color: #1f2937;">${styleData.style_name || 'N/A'}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <i class="fas fa-user" style="color: #6b7280;"></i>
                                <div>
                                    <span style="font-weight: 500; color: #1f2937;">Buyer:</span>
                                    <span style="color: #1f2937;">${styleData.buyer_name || 'N/A'}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <i class="fas fa-tshirt" style="color: #6b7280;"></i>
                                <div>
                                    <span style="font-weight: 500; color: #1f2937;">Sample Type:</span>
                                    <span style="color: #1f2937;">${styleData.sample_type || 'N/A'}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <i class="fas fa-calendar-alt" style="color: #6b7280;"></i>
                                <div>
                                    <span style="font-weight: 500; color: #1f2937;">Expected Completion:</span>
                                    <span style="color: #1f2937;">${expectedDate}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <i class="fas fa-comment" style="color: #6b7280;"></i>
                                <div>
                                    <span style="font-weight: 500; color: #1f2937;">Remarks:</span>
                                    <span style="color: #1f2937;">${styleData.remarks || 'N/A'}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <i class="fas fa-user-edit" style="color: #6b7280;"></i>
                                <div>
                                    <span style="font-weight: 500; color: #1f2937;">Created By:</span>
                                    <span style="color: #1f2937;">${styleData.created_by || 'N/A'}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <i class="fas fa-clock" style="color: #6b7280;"></i>
                                <div>
                                    <span style="font-weight: 500; color: #1f2937;">Created On:</span>
                                    <span style="color: #1f2937;">${createdDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bill of Materials -->
                <div class="accordion-item" style="margin-bottom: 16px;">
                    <button class="accordion-header" style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left;">
                        <span style="font-size: 1.125rem; font-weight: 500; color: #1f2937;"><i class="fas fa-list-ul" style="margin-right: 8px;"></i> Bill of Materials (${styleData.bom.length})</span>
                        <i class="fas fa-chevron-down accordion-icon" style="color: #1f2937;"></i>
                    </button>
                    <div class="accordion-content hidden" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;">
                        ${bomDetailsHTML}
                    </div>
                </div>

                <!-- Purchase Requisition - Fabric -->
                <div class="accordion-item" style="margin-bottom: 16px;">
                    <button class="accordion-header" style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left;">
                        <span style="font-size: 1.125rem; font-weight: 500; color: #1f2937;"><i class="fas fa-tshirt" style="margin-right: 8px;"></i> Purchase Requisition - Fabric (${styleData.prFabric.length})</span>
                        <i class="fas fa-chevron-down accordion-icon" style="color: #1f2937;"></i>
                    </button>
                    <div class="accordion-content hidden" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;">
                        ${prFabricDetailsHTML}
                    </div>
                </div>

                <!-- Purchase Requisition - Accessories -->
                <div class="accordion-item" style="margin-bottom: 16px;">
                    <button class="accordion-header" style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left;">
                        <span style="font-size: 1.125rem; font-weight: 500; color: #1f2937;"><i class="fas fa-cut" style="margin-right: 8px;"></i> Purchase Requisition - Accessories (${styleData.prAccessories.length})</span>
                        <i class="fas fa-chevron-down accordion-icon" style="color: #1f2937;"></i>
                    </button>
                    <div class="accordion-content hidden" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;">
                        ${prAccessoriesDetailsHTML}
                    </div>
                </div>

                <!-- Purchase Order - Fabric -->
                <div class="accordion-item" style="margin-bottom: 16px;">
                    <button class="accordion-header" style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left;">
                        <span style="font-size: 1.125rem; font-weight: 500; color: #1f2937;"><i class="fas fa-file-invoice" style="margin-right: 8px;"></i> Purchase Order - Fabric (${styleData.poFabric.length})</span>
                        <i class="fas fa-chevron-down accordion-icon" style="color: #1f2937;"></i>
                    </button>
                    <div class="accordion-content hidden" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;">
                        ${poFabricDetailsHTML}
                    </div>
                </div>

                <!-- Purchase Order - Accessories -->
                <div class="accordion-item" style="margin-bottom: 16px;">
                    <button class="accordion-header" style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left;">
                        <span style="font-size: 1.125rem; font-weight: 500; color: #1f2937;"><i class="fas fa-file-invoice" style="margin-right: 8px;"></i> Purchase Order - Accessories (${styleData.poAccessories.length})</span>
                        <i class="fas fa-chevron-down accordion-icon" style="color: #1f2937;"></i>
                    </button>
                    <div class="accordion-content hidden" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;">
                        ${poAccessoriesDetailsHTML}
                    </div>
                </div>

                <!-- Goods Received Notes -->
                <div class="accordion-item" style="margin-bottom: 16px;">
                    <button class="accordion-header" style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left;">
                        <span style="font-size: 1.125rem; font-weight: 500; color: #1f2937;"><i class="fas fa-receipt" style="margin-right: 8px;"></i> Goods Received Notes (${styleData.grn.length})</span>
                        <i class="fas fa-chevron-down accordion-icon" style="color: #1f2937;"></i>
                    </button>
                    <div class="accordion-content hidden" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;">
                        ${grnDetailsHTML}
                    </div>
                </div>

                <!-- Overall Status -->
                <div class="accordion-item">
                    <button class="accordion-header" style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left;">
                        <span style="font-size: 1.125rem; font-weight: 500; color: #1f2937;"><i class="fas fa-tachometer-alt" style="margin-right: 8px;"></i> Overall Status</span>
                        <i class="fas fa-chevron-down accordion-icon" style="color: #1f2937;"></i>
                    </button>
                    <div class="accordion-content hidden" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <i class="fas fa-chart-line" style="color: ${getStatusColor(styleData.procurement_status)};"></i>
                            <div>
                                <span style="font-weight: 500; color: #1f2937;">Procurement Status:</span>
                                <span style="color: ${getStatusColor(styleData.procurement_status)};">${styleData.procurement_status || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer" style="padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; justify-content: flex-end;">
            <button class="action-button edit-button" onclick="window.location.href='intro.html?id=${styleData.id || styleData.style_id}'" style="background-color: #3b82f6; color: #ffffff; padding: 8px 16px; border-radius: 4px; border: none;">
                <i class="fas fa-edit" style="margin-right: 4px;"></i> Edit Style
            </button>
            <button class="action-button close-button" style="background-color: #e5e7eb; color: #1f2937; padding: 8px 16px; border-radius: 4px; border: none;">
                <i class="fas fa-times" style="margin-right: 4px;"></i> Close
            </button>
        </div>
    `;
    
    function getStatusColor(status) {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'GRN Pending':
            case 'PO Approval Pending': return '#f59e0b';
            case 'BOM Pending':
            case 'PR Pending':
            case 'PO Pending': return '#ef4444';
            default: return '#6b7280';
        }
    }
    
    modalContent.appendChild(closeButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    const accordionHeaders = modalContent.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.accordion-icon');
            const isOpen = !content.classList.contains('hidden');
            
            modalContent.querySelectorAll('.accordion-content').forEach(c => {
                c.classList.add('hidden');
                c.previousElementSibling.querySelector('.accordion-icon').classList.remove('fa-chevron-up');
                c.previousElementSibling.querySelector('.accordion-icon').classList.add('fa-chevron-down');
            });
            
            if (!isOpen) {
                content.classList.remove('hidden');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
    
    if (accordionHeaders.length > 0) {
        accordionHeaders[0].click();
    }
    
    modalContent.querySelector('.close-button').addEventListener('click', () => {
        modalOverlay.classList.add('fade-out');
        setTimeout(() => document.body.removeChild(modalOverlay), 300);
    });
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('fade-out');
            setTimeout(() => document.body.removeChild(modalOverlay), 300);
        }
    });
    
    document.addEventListener('keydown', function closeModalOnEsc(e) {
        if (e.key === 'Escape') {
            modalOverlay.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
                document.removeEventListener('keydown', closeModalOnEsc);
            }, 300);
        }
    });
}