// Procurement Status JavaScript

// Toggle section visibility
function toggleProcurementSection(section) {
    const contentElement = document.getElementById(`${section}-content`);
    const chevronElement = document.getElementById(`${section}-chevron`);
    
    if (contentElement.style.display === 'none') {
        contentElement.style.display = 'block';
        chevronElement.classList.remove('fa-chevron-down');
        chevronElement.classList.add('fa-chevron-up');
    } else {
        contentElement.style.display = 'none';
        chevronElement.classList.remove('fa-chevron-up');
        chevronElement.classList.add('fa-chevron-down');
    }
}

// Helper functions for status indicators
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'in transit': return 'bg-blue-500';
        case 'shipped': return 'bg-indigo-500';
        case 'processing': return 'bg-amber-500';
        case 'delivered': return 'bg-green-500';
        case 'delayed': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
}

function getStatusIcon(status) {
    switch (status.toLowerCase()) {
        case 'in transit': return '<i class="fas fa-truck"></i>';
        case 'shipped': return '<i class="fas fa-box"></i>';
        case 'processing': return '<i class="fas fa-clock"></i>';
        case 'delivered': return '<i class="fas fa-check-circle"></i>';
        case 'delayed': return '<i class="fas fa-exclamation-triangle"></i>';
        default: return '<i class="fas fa-info-circle"></i>';
    }
}

// Format date for display
function formatBetterDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Update Fabric Status with new UI
function updateFabricStatus(data) {
    document.getElementById('fabric-pending-pr').textContent = data.pendingPR || 0;
    document.getElementById('fabric-pending-po').textContent = data.pendingPO || 0;
    document.getElementById('fabric-in-delivery').textContent = data.inDelivery || 0;
    document.getElementById('fabric-completed').textContent = data.completed || 0;
    
    const total = data.total || 1;
    const completed = data.completed || 0;
    const percentage = Math.min(100, Math.round((completed / total) * 100));
    
    document.getElementById('fabric-progress').style.width = `${percentage}%`;
    document.getElementById('fabric-progress-text').textContent = `${percentage}%`;
}

// Update Accessories Status with new UI
function updateAccessoriesStatus(data) {
    document.getElementById('acc-pending-pr').textContent = data.pendingPR || 0;
    document.getElementById('acc-pending-po').textContent = data.pendingPO || 0;
    document.getElementById('acc-in-delivery').textContent = data.inDelivery || 0;
    document.getElementById('acc-completed').textContent = data.completed || 0;
    
    const total = data.total || 1;
    const completed = data.completed || 0;
    const percentage = Math.min(100, Math.round((completed / total) * 100));
    
    document.getElementById('acc-progress').style.width = `${percentage}%`;
    document.getElementById('acc-progress-text').textContent = `${percentage}%`;
}

// Update Fabric Timeline with new UI
function updateFabricTimeline(deliveries) {
    const timeline = document.getElementById('fabric-timeline');
    if (!timeline) return;

    if (!deliveries || deliveries.length === 0) {
        timeline.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No upcoming fabric deliveries</td></tr>';
        return;
    }

    timeline.innerHTML = '';

    deliveries.forEach(delivery => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${delivery.fabric_type}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${delivery.quantity} ${delivery.unit}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${delivery.supplier_name || 'Unknown Supplier'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${formatBetterDate(delivery.expected_delivery_date)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status || 'Processing')} text-white">
                    ${getStatusIcon(delivery.status || 'Processing')}
                    <span class="ml-1">${delivery.status || 'Processing'}</span>
                </span>
            </td>
        `;

        timeline.appendChild(row);
    });
}

// Update Accessories Timeline with new UI
function updateAccessoriesTimeline(deliveries) {
    const timeline = document.getElementById('accessories-timeline');
    if (!timeline) return;

    if (!deliveries || deliveries.length === 0) {
        timeline.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No upcoming accessories deliveries</td></tr>';
        return;
    }

    timeline.innerHTML = '';

    deliveries.forEach(delivery => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        // Add a status field if it doesn't exist
        const status = delivery.status || 'Processing';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${delivery.accessory_name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${delivery.quantity} ${delivery.unit || 'pcs'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${delivery.vendor_name || 'Unknown Vendor'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${formatBetterDate(delivery.expected_delivery_date)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)} text-white">
                    ${getStatusIcon(status)}
                    <span class="ml-1">${status}</span>
                </span>
            </td>
        `;

        timeline.appendChild(row);
    });
}