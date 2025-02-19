class Dashboard {
    static init() {
        this.loadUserData();
        this.setupUploadArea();
    }

    static async loadUserData() {
        try {
            const response = await API.getUserProfile();
            if (response.success && response.user) {
                document.getElementById('credit-count').textContent = response.user.credits;
                this.updateUploadAreaState();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    static setupUploadArea() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

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
                fileInput.value = '';
            }
        });
    }

    static async handleFileUpload(file) {
        const uploadStatus = document.getElementById('upload-status');
        const credits = parseInt(document.getElementById('credit-count').textContent);
        
        if (credits <= 0) {
            uploadStatus.innerHTML = `
                <div class="alert alert-danger">
                    <h3>Insufficient Credits</h3>
                    <p>You have no credits remaining. Please visit your profile to request more credits.</p>
                    <a href="profile.html" class="btn btn-primary">Go to Profile</a>
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
            
            if (response.success) {
                this.displayUploadResults(response, file.name);
                this.loadUserData(); // Refresh credit count
            }
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

    static updateUploadAreaState() {
        const credits = parseInt(document.getElementById('credit-count').textContent);
        const uploadArea = document.getElementById('upload-area');
        
        if (credits <= 0) {
            uploadArea.classList.add('disabled');
            uploadArea.innerHTML = `
                <div class="upload-icon">📄</div>
                <p>No credits available</p>
                <small>Please visit your profile to request more credits</small>
            `;
        } else {
            uploadArea.classList.remove('disabled');
            uploadArea.innerHTML = `
                <div class="upload-icon">📄</div>
                <p>Drag & drop your document here or click to browse</p>
                <small>Only .txt files are supported</small>
                <input type="file" id="file-input" hidden accept=".txt" onchange="event.preventDefault();">
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
            
            uploadStatus.innerHTML = `
                <div class="alert alert-success upload-result">
                    <div class="upload-header">
                        <h3>Upload Successful!</h3>
                        <p>Document: ${fileName}</p>
                        <p>Remaining credits: ${response.remainingCredits}</p>
                    </div>
                    ${similarDocsHtml}
                </div>
            `;
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

    static generateSimilarityResultsHtml(documents) {
        if (!documents || documents.length === 0) {
            return `
                <div class="similarity-results">
                    <h3>Similarity Analysis</h3>
                    <p>No similar documents found</p>
                </div>
            `;
        }

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
                        ${this.generateMatchingSentencesHtml(document.matchingSentences)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    static getSimilarityClass(similarity) {
        if (similarity >= 80) return 'high-similarity';
        if (similarity >= 50) return 'medium-similarity';
        return 'low-similarity';
    }

    static generateMatchingSentencesHtml(sentences) {
        if (!sentences || sentences.length === 0) {
            return '<p>No matching sentences found</p>';
        }

        return `
            <div class="matching-sentences">
                <h5>Matching Content (${sentences.length} matches):</h5>
                <div class="matches-container">
                    ${sentences.map(match => `
                        <div class="match-pair">
                            <div class="match-source">
                                <strong>Source:</strong> 
                                <span class="match-text">${match.sentence1}</span>
                            </div>
                            <div class="match-target">
                                <strong>Match:</strong> 
                                <span class="match-text">${match.sentence2}</span>
                                <span class="match-similarity">${match.similarity}% match</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
}); 