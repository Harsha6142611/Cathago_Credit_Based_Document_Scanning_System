class Profile {
    static init() {
        this.loadUserData();
        this.setupTabs();
        this.setupCreditRequestForm();
    }

    static async loadUserData() {
        try {
            const response = await API.getUserProfile();
            if (response.success && response.user) {
                document.getElementById('username').textContent = response.user.username;
                document.getElementById('credit-count').textContent = response.user.credits;
                document.getElementById('profile-credits').textContent = response.user.credits;
                
                this.loadScanHistory();
                this.loadCreditRequestStatus();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    static setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and panes
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding pane
                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    static async loadScanHistory() {
        try {
            const response = await API.getUserProfile();
            const scanHistory = document.getElementById('scan-history');
            
            if (!response.success || !response.user.documents) {
                scanHistory.innerHTML = '<li>No scans yet</li>';
                return;
            }

            const documents = response.user.documents;
            if (documents.length === 0) {
                scanHistory.innerHTML = '<li>No scans yet</li>';
                return;
            }

            scanHistory.innerHTML = documents
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(doc => `
                    <li class="scan-item">
                        <div>
                            <strong>${doc.filename}</strong>
                            <br>
                            <small>${new Date(doc.createdAt).toLocaleString()}</small>
                        </div>
                        <span class="status-badge status-${doc.processingStatus.toLowerCase()}">
                            ${doc.processingStatus}
                        </span>
                    </li>
                `).join('');
        } catch (error) {
            console.error('Error loading scan history:', error);
            document.getElementById('scan-history').innerHTML = 
                '<li>Error loading scan history</li>';
        }
    }

    static setupCreditRequestForm() {
        const form = document.getElementById('credit-request-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const credits = form.credits.value;
                    const reason = form.reason.value;

                    const response = await API.request(CONFIG.ROUTES.CREDITS.REQUEST, {
                        method: 'POST',
                        body: JSON.stringify({
                            requestedCredits: credits,
                            reason: reason
                        })
                    });

                    if (response.success) {
                        alert('Credit request submitted successfully');
                        form.reset();
                        await this.loadCreditRequestStatus();
                    }
                } catch (error) {
                    console.error('Credit request error:', error);
                    alert('Error submitting credit request');
                }
            });
        }
    }

    static async loadCreditRequestStatus() {
        try {
            const response = await API.getUserProfile();
            const container = document.getElementById('credit-requests-status');
            
            if (!response.success || !response.user.creditRequests) {
                container.innerHTML = '<p>No credit requests found</p>';
                return;
            }

            const requests = response.user.creditRequests;
            if (requests.length === 0) {
                container.innerHTML = '<p>No credit requests found</p>';
                return;
            }

            container.innerHTML = requests
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(req => `
                    <div class="request-item ${req.status.toLowerCase()}">
                        <p><strong>Requested Credits:</strong> ${req.requestedCredits}</p>
                        <p><strong>Reason:</strong> ${req.reason}</p>
                        <p><strong>Status:</strong> 
                            <span class="status-badge status-${req.status.toLowerCase()}">${req.status}</span>
                        </p>
                        ${req.status === 'denied' && req.adminResponse ? `
                            <div class="admin-feedback">
                                <p><strong>Denial Reason:</strong></p>
                                <p class="admin-message">${req.adminResponse}</p>
                            </div>
                        ` : ''}
                        <p><strong>Requested on:</strong> ${new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                `).join('');
        } catch (error) {
            console.error('Error loading credit requests:', error);
            document.getElementById('credit-requests-status').innerHTML = 
                '<p>Error loading credit requests</p>';
        }
    }
}

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Profile.init();
}); 