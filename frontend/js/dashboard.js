class Dashboard {
    static init() {
        // Prevent any form submissions from refreshing
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            return false;
        });

        // Prevent accidental page refreshes
        window.addEventListener('beforeunload', (e) => {
            const savedResults = localStorage.getItem('lastUploadResults');
            if (savedResults) {
                e.preventDefault();
                e.returnValue = 'You have unsaved similarity results. Are you sure you want to leave?';
            }
        });

        this.loadUserData();
        this.setupUploadArea();
        this.loadScanHistory();
        this.setupCreditRequestForm();
        this.checkAndRestoreResults();
        this.loadCreditRequestStatus();
    }

    static async loadUserData() {
        try {
            const response = await API.getUserProfile();
            if (response.success && response.user) {
                document.getElementById('username').textContent = response.user.username;
                document.getElementById('credit-count').textContent = response.user.credits;
                
                // Update upload area state based on credits
                this.updateUploadAreaState();
                
                // Show warning if credits are low
                if (response.user.credits < 5) {
                    const creditCount = document.querySelector('.credit-badge');
                    const warning = document.createElement('div');
                    warning.className = 'credit-warning';
                    warning.textContent = response.user.credits === 0 
                        ? 'No credits remaining. Please wait for daily reset or request more.'
                        : 'Low credits remaining!';
                    creditCount.appendChild(warning);
                }
            } else {
                console.error('Invalid response format:', response);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    static setupUploadArea() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

        // Prevent default behaviors
        uploadArea.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('highlight');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('highlight');
        });

        uploadArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('highlight');
            
            const file = e.dataTransfer.files[0];
            if (file) {
                await this.handleFileUpload(file);
            }
        });

        fileInput.addEventListener('change', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const file = e.target.files[0];
            if (file) {
                await this.handleFileUpload(file);
                fileInput.value = ''; // Reset input
            }
        });
    }

    static async handleFileUpload(file) {
        const uploadStatus = document.getElementById('upload-status');
        const uploadArea = document.getElementById('upload-area');
        
        // Check credits before attempting upload
        const credits = parseInt(document.getElementById('credit-count').textContent);
        if (credits <= 0) {
            uploadStatus.innerHTML = `
                <div class="alert alert-danger">
                    <h3>Insufficient Credits</h3>
                    <p>You have no credits remaining. Please wait for the daily reset or request more credits.</p>
                    <button class="btn btn-primary" onclick="document.querySelector('#credit-request-form').scrollIntoView({behavior: 'smooth'})">
                        Request Credits
                    </button>
                </div>
            `;
            return;
        }

        uploadStatus.innerHTML = '<div class="alert">Uploading and analyzing document...</div>';

        try {
            if (!file.name.endsWith('.txt')) {
                throw new Error('Only .txt files are allowed');
            }

            const formData = new FormData();
            formData.append('document', file);

            const response = await API.uploadDocument(formData);
            
            if (response.creditsRequired) {
                uploadStatus.innerHTML = `
                    <div class="alert alert-danger">
                        <h3>Insufficient Credits</h3>
                        <p>You have no credits remaining. Please wait for the daily reset or request more credits.</p>
                        <button class="btn btn-primary" onclick="document.querySelector('#credit-request-form').scrollIntoView({behavior: 'smooth'})">
                            Request Credits
                        </button>
                    </div>
                `;
                return;
            }

            // Store the results in localStorage instead of sessionStorage for better persistence
            localStorage.setItem('lastUploadResults', JSON.stringify({
                response,
                fileName: file.name,
                timestamp: new Date().getTime()
            }));

            // Prevent any pending refreshes
            if (window.refreshTimeout) {
                clearTimeout(window.refreshTimeout);
            }

            // Display results immediately
            this.displayUploadResults(response, file.name);

            // Update scan history without refreshing
            await this.loadScanHistory();
            
            // Scroll to results smoothly
            uploadStatus.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Upload error:', error);
            uploadStatus.innerHTML = `
                <div class="alert alert-danger">
                    <h3>Upload Failed</h3>
                    <p>${error.message || 'Error uploading document'}</p>
                </div>
            `;
        }
    }

    static displayUploadResults(response, fileName) {
        const uploadStatus = document.getElementById('upload-status');
        
        try {
            if (!response.similarDocuments) {
                throw new Error('No similarity data found');
            }

            const similarDocsHtml = this.generateSimilarityResultsHtml(response.similarDocuments);
            
            const resultHtml = `
                <div class="alert alert-success upload-result">
                    <div class="upload-header">
                        <h3>Upload Successful!</h3>
                        <p>Document: ${fileName}</p>
                        <p>Remaining credits: ${response.remainingCredits}</p>
                    </div>
                    ${similarDocsHtml}
                </div>
            `;

            // Update the DOM in a single operation
            requestAnimationFrame(() => {
                uploadStatus.innerHTML = resultHtml;
                uploadStatus.classList.add('results-displayed');
                
                // Update credits display
                const creditCount = document.getElementById('credit-count');
                if (creditCount) {
                    creditCount.textContent = response.remainingCredits;
                }
            });

        } catch (error) {
            console.error('Error displaying results:', error);
            uploadStatus.innerHTML = `
                <div class="alert alert-danger">
                    <h3>Error Displaying Results</h3>
                    <p>${error.message || 'There was an error showing the results. Please try again.'}</p>
                </div>
            `;
        }
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
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            requestedCredits: credits,
                            reason: reason
                        })
                    });

                    if (response.success) {
                        alert('Credit request submitted successfully');
                        form.reset();
                        // Refresh the credit request status
                        await this.loadCreditRequestStatus();
                    } else {
                        throw new Error(response.message || 'Failed to submit credit request');
                    }
                } catch (error) {
                    console.error('Credit request error:', error);
                    // Only show alert for non-fetch errors
                    if (!error.message.includes('Failed to fetch')) {
                        alert('Error submitting credit request. Please try again.');
                    }
                }
            });
        }
    }

    // Helper function to determine similarity class
    static getSimilarityClass(similarity) {
        if (similarity >= 80) return 'high-similarity';
        if (similarity >= 50) return 'medium-similarity';
        return 'low-similarity';
    }

    static generateSimilarityResultsHtml(documents) {
        if (documents && documents.length > 0) {
            return `
                <div class="similarity-results">
                    <h3>Similarity Analysis Results</h3>
                    ${documents.map(({ document }) => `
                        <div class="similar-doc-result">
                            <div class="doc-header">
                                <h4>${document.filename}</h4>
                                <span class="similarity-badge ${this.getSimilarityClass(document.overallSimilarity)}">
                                    ${document.overallSimilarity}% Similar
                                </span>
                            </div>
                            ${document.matchingSentences && document.matchingSentences.length > 0 ? `
                                <div class="matching-sentences">
                                    <h5>Matching Content (${document.matchingSentences.length} matches):</h5>
                                    <div class="matches-container">
                                        ${document.matchingSentences.map(match => `
                                            <div class="match-pair">
                                                <div class="match-source">
                                                    <strong>Source:</strong> 
                                                    <span class="match-text">${match.sentence1}</span>
                                                </div>
                                                <div class="match-target">
                                                    <strong>Match:</strong> 
                                                    <span class="match-text">${match.sentence2}</span>
                                                    <span class="match-similarity">
                                                        ${match.similarity}% match
                                                    </span>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : '<p>No matching sentences found</p>'}
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            return `
                <div class="similarity-results">
                    <h3>Similarity Analysis</h3>
                    <p>No similar documents found</p>
                </div>
            `;
        }
    }

    // Add this method to check and restore results
    static checkAndRestoreResults() {
        try {
            const savedResults = localStorage.getItem('lastUploadResults');
            if (savedResults) {
                const { response, fileName, timestamp } = JSON.parse(savedResults);
                
                // Only restore if results are less than 1 hour old
                const oneHour = 60 * 60 * 1000;
                if (new Date().getTime() - timestamp < oneHour) {
                    this.displayUploadResults(response, fileName);
                } else {
                    // Clear old results
                    localStorage.removeItem('lastUploadResults');
                }
            }
        } catch (error) {
            console.error('Error restoring results:', error);
        }
    }

    // Add this method to disable upload area when no credits
    static updateUploadAreaState() {
        const credits = parseInt(document.getElementById('credit-count').textContent);
        const uploadArea = document.getElementById('upload-area');
        
        if (credits <= 0) {
            uploadArea.classList.add('disabled');
            uploadArea.innerHTML = `
                <p>No credits available</p>
                <small>Please wait for daily reset or request more credits</small>
            `;
        } else {
            uploadArea.classList.remove('disabled');
            uploadArea.innerHTML = `
                <p>Drag & drop your document here or click to browse</p>
                <small>Only .txt files are supported</small>
            `;
        }
    }

    static async loadCreditRequestStatus() {
        try {
            const response = await API.getUserProfile();
            if (response.success && response.user.creditRequests) {
                const creditRequestsDiv = document.createElement('div');
                creditRequestsDiv.className = 'credit-requests-status';
                
                const pendingRequests = response.user.creditRequests.filter(req => req.status === 'pending');
                const recentRequests = response.user.creditRequests
                    .filter(req => req.status !== 'pending')
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);

                let html = '<h3>Credit Requests Status</h3>';
                
                if (pendingRequests.length > 0) {
                    html += `
                        <div class="pending-requests">
                            <h4>Pending Requests</h4>
                            ${pendingRequests.map(req => `
                                <div class="request-item pending">
                                    <p><strong>Requested Credits:</strong> ${req.requestedCredits}</p>
                                    <p><strong>Your Reason:</strong> ${req.reason || 'No reason provided'}</p>
                                    <p><strong>Status:</strong> <span class="status-badge status-pending">Pending</span></p>
                                    <p><strong>Submitted:</strong> ${new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }

                if (recentRequests.length > 0) {
                    html += `
                        <div class="recent-requests">
                            <h4>Recent Requests</h4>
                            ${recentRequests.map(req => `
                                <div class="request-item ${req.status.toLowerCase()}">
                                    <p><strong>Requested Credits:</strong> ${req.requestedCredits}</p>
                                    <p><strong>Your Reason:</strong> ${req.reason || 'No reason provided'}</p>
                                    <p><strong>Status:</strong> <span class="status-badge status-${req.status.toLowerCase()}">${req.status}</span></p>
                                    ${req.status === 'denied' && req.adminResponse ? `
                                        <div class="admin-feedback">
                                            <p><strong>Denial Reason:</strong></p>
                                            <p class="admin-message">${req.adminResponse}</p>
                                        </div>
                                    ` : ''}
                                    <p><strong>Processed:</strong> ${new Date(req.updatedAt).toLocaleDateString()}</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }

                if (!pendingRequests.length && !recentRequests.length) {
                    html += '<p>No credit requests found</p>';
                }

                creditRequestsDiv.innerHTML = html;
                
                // Insert after the credit request form
                const creditRequestForm = document.getElementById('credit-request-form');
                creditRequestForm.parentNode.insertBefore(creditRequestsDiv, creditRequestForm.nextSibling);
            }
        } catch (error) {
            console.error('Error loading credit request status:', error);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
}); 