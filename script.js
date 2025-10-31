function showContent(num) {
    // Hide main menu
    document.getElementById('mainMenu').style.display = 'none';
    
    // Hide all content sections
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected content
    document.getElementById('content' + num).classList.add('active');
    
    // Initialize quiz navigation if content 7 (quiz)
    if (num === 7) {
        initQuizNavigation();
    }
}

function backToMenu() {
    // Hide all content sections
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show main menu
    document.getElementById('mainMenu').style.display = 'grid';
}

// --- Quiz Navigation ---
let currentQuestion = 1;
const totalQuestions = 10;

function initQuizNavigation() {
    currentQuestion = 1;
    showQuestion(currentQuestion);
    updateNavigationButtons();
}

function showQuestion(questionNumber) {
    const cards = document.querySelectorAll('.quiz-card');
    cards.forEach((card, index) => {
        card.classList.remove('active');
        if (index + 1 === questionNumber) {
            card.classList.add('active');
        }
    });
    
    // Update indicator
    const indicator = document.getElementById('questionIndicator');
    if (indicator) {
        indicator.textContent = `Soal ${questionNumber} dari ${totalQuestions}`;
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentQuestion === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentQuestion === totalQuestions;
    }
}

function previousQuestion() {
    if (currentQuestion > 1) {
        currentQuestion--;
        showQuestion(currentQuestion);
        updateNavigationButtons();
    }
}

function nextQuestion() {
    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        showQuestion(currentQuestion);
        updateNavigationButtons();
    }
}

// --- Quiz logic ---

// Track quiz progress
function updateQuizProgress() {
    const form = document.getElementById('quizForm');
    if (!form) return;

    let answered = 0;
    for (let i = 1; i <= 10; i++) {
        const name = 'q' + i;
        const node = form.querySelector('input[name="'+name+'"]:checked');
        if (node) {
            answered++;
            // Mark card as answered
            const card = form.querySelector('.quiz-card[data-question="'+i+'"]');
            if (card) card.classList.add('answered');
        }
    }

    // Update progress bar
    const progressBar = document.getElementById('quizProgressBar');
    const progressText = document.getElementById('quizProgressText');
    
    if (progressBar && progressText) {
        const percentage = (answered / 10) * 100;
        progressBar.style.width = percentage + '%';
        progressText.textContent = answered + '/10 Soal Terjawab';
    }
}

// Add event listeners to all radio buttons
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quizForm');
    if (form) {
        const radios = form.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', updateQuizProgress);
        });
    }
});

function gradeQuiz() {
    const answers = {
        q1: 'L',
        q2: 'E',
        q3: 'TR',
        q4: 'O',
        q5: 'H',
        q6: 'MI',
        q7: 'RO',
        q8: 'A',
        q9: 'PL',
        q10: 'PE'
    };

    const form = document.getElementById('quizForm');
    if (!form) return;

    // Check if all questions are answered
    let allAnswered = true;
    for (let i = 1; i <= 10; i++) {
        const name = 'q' + i;
        const node = form.querySelector('input[name="'+name+'"]:checked');
        if (!node) {
            allAnswered = false;
            break;
        }
    }

    // If not all answered, show alert and return
    if (!allAnswered) {
        showCustomAlert('⚠️ Harap jawab semua soal terlebih dahulu!\n\nAnda harus menjawab semua 10 soal sebelum submit.');
        return;
    }

    let totalCorrect = 0;
    const perSub = {1:0,2:0,3:0,4:0,5:0,6:0};

    for (let i = 1; i <= 10; i++) {
        const name = 'q' + i;
        const node = form.querySelector('input[name="'+name+'"]:checked');
        const value = node ? node.value : null;
        if (value && value === answers[name]) {
            totalCorrect += 1;
            const sub = Math.ceil(i/2);
            perSub[sub] += 1;
        }
    }

    // Calculate score and percentage
    const totalPoints = totalCorrect;
    const percent = (totalPoints/10)*100;

    // Helpers for history storage
    function getQuizHistory() {
        try {
            const raw = localStorage.getItem('autocad_quiz_history');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('Cannot read quiz history', e);
            return [];
        }
    }

    function saveQuizHistory(hist) {
        try {
            localStorage.setItem('autocad_quiz_history', JSON.stringify(hist));
        } catch (e) {
            console.warn('Cannot save quiz history', e);
        }
    }

    // Persist attempt to history (localStorage)
    const attempt = {
        timestamp: Date.now(),
        score: totalPoints,
        percent: Math.round(percent),
        perSub: perSub
    };

    const history = getQuizHistory();
    history.push(attempt);
    saveQuizHistory(history);

    // Build modern result HTML
    const resultDiv = document.getElementById('quizResult');
    
    let html = '<div class="content-section">';
    html += '<h3>🎉 Hasil Quiz Anda</h3>';
    
    // Big score display
    html += '<div class="score-display">' + totalPoints + '/10</div>';
    html += '<p style="text-align:center; font-size:1.2em; color:#6c757d; margin-bottom:25px;">';
    html += 'Skor Anda: <strong>' + percent.toFixed(0) + '%</strong></p>';
    
    // Per-subchapter breakdown
    html += '<div class="summary-grid">';
    const topics = ['Line & Erase', 'Trim & Offset', 'Hatch', 'Mirror & Rotate', 'Arc & Polyline', 'Kusen Detail'];
    for (let s = 1; s <= 6; s++) {
        const score = perSub[s] || 0;
        const emoji = score === 2 ? '✅' : score === 1 ? '⚠️' : '❌';
        html += '<div class="summary-card">';
        html += '<div class="summary-title">' + emoji + ' ' + topics[s-1] + '</div>';
        html += '<p><strong>' + score + ' / 2</strong></p>';
        html += '</div>';
    }
    html += '</div>';

    // Feedback based on score
    let feedback = '';
    let feedbackColor = '';
    if (percent === 100) {
        feedback = '🏆 Sempurna! Anda menguasai semua materi AutoCAD dengan sangat baik!';
        feedbackColor = '#28a745';
    } else if (percent >= 80) {
        feedback = '🎯 Bagus sekali! Hampir sempurna, pertahankan!';
        feedbackColor = '#20c997';
    } else if (percent >= 60) {
        feedback = '👍 Cukup baik! Masih ada beberapa yang perlu dipelajari lagi.';
        feedbackColor = '#ffc107';
    } else if (percent >= 40) {
        feedback = '📚 Perlu latihan lagi. Coba ulangi materi yang belum dikuasai.';
        feedbackColor = '#fd7e14';
    } else {
        feedback = '💪 Jangan menyerah! Pelajari kembali materi dan coba lagi.';
        feedbackColor = '#dc3545';
    }

    html += '<div class="alert-box" style="background:#f8f9fa; border-left:5px solid ' + feedbackColor + '; text-align:center;">';
    html += '<strong style="color:' + feedbackColor + '; font-size:1.2em;">' + feedback + '</strong>';
    html += '</div>';

    // Get current history to check attempt count
    const currentHistory = getQuizHistory();
    const attemptCount = currentHistory.length;
    const canViewAnswers = (percent === 100) || (attemptCount >= 3);

    // Show answer key button (only if conditions met)
    if (canViewAnswers) {
        html += '<div style="text-align:center; margin-top:20px;">';
        html += '<button class="btn-secondary" onclick="toggleAnswers()" style="display:inline-flex;">';
        html += '<span>📝 Lihat Kunci Jawaban</span></button>';
        html += '</div>';
        
        html += '<div id="answerKey" style="display:none;">';
        html += '<h4>📋 Kunci Jawaban Lengkap</h4><ol>';
        const questions = [
            'Perintah garis',
            'Perintah hapus',
            'Perintah trim',
            'Perintah offset',
            'Perintah hatch',
            'Perintah mirror',
            'Perintah rotate',
            'Perintah arc',
            'Perintah polyline',
            'Perintah pedit'
        ];
        for (let i=1; i<=10; i++) {
            html += '<li>' + questions[i-1] + ': <code>' + answers['q'+i] + '</code></li>';
        }
        html += '</ol></div>';
    } else {
        // Show locked message
        const remaining = 3 - attemptCount;
        html += '<div style="text-align:center; margin-top:20px; padding:15px; background:#fff3cd; border-radius:12px; border:2px solid #ffc107;">';
        html += '<p style="margin:0; color:#856404; font-weight:600;">🔒 Kunci Jawaban Terkunci</p>';
        html += '<p style="margin:5px 0 0 0; color:#856404; font-size:0.9em;">Dapatkan nilai 100% atau coba ' + remaining + ' kali lagi untuk membuka kunci jawaban.</p>';
        html += '</div>';
    }

    html += '</div>';

    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';

    // Render attempt history below results
    (function renderHistory() {
        try {
            const hist = getQuizHistory();
            if (!hist || hist.length === 0) return;

            // Build history HTML (latest first)
            const histHtml = [];
            hist.slice().reverse().forEach((h, idx) => {
                const dt = new Date(h.timestamp);
                const when = dt.toLocaleString();
                histHtml.push('<div class="summary-card">');
                histHtml.push('<div class="summary-title">Percobaan ' + (hist.length - idx) + ' — ' + when + '</div>');
                histHtml.push('<p><strong>' + h.score + ' / 10</strong> — ' + h.percent + '%</p>');
                histHtml.push('</div>');
            });

            const historyContainer = document.createElement('div');
            historyContainer.style.marginTop = '24px';
            historyContainer.innerHTML = '<h4>📊 Riwayat Nilai</h4><div class="summary-grid">' + histHtml.join('') + '</div>';
            resultDiv.appendChild(historyContainer);
        } catch (e) {
            console.warn('Failed to render history', e);
        }
    })();

    // Scroll to result
    setTimeout(() => {
        resultDiv.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }, 100);
}

function toggleAnswers() {
    const key = document.getElementById('answerKey');
    if (!key) return;
    if (key.style.display === 'none') {
        key.style.display = 'block';
        key.style.animation = 'slideIn 0.4s ease';
    } else {
        key.style.display = 'none';
    }
}

function resetQuiz() {
    const form = document.getElementById('quizForm');
    if (!form) return;
    
    form.reset();
    
    // Remove answered class from cards
    const cards = form.querySelectorAll('.quiz-card');
    cards.forEach(card => card.classList.remove('answered'));
    
    // Reset progress bar
    const progressBar = document.getElementById('quizProgressBar');
    const progressText = document.getElementById('quizProgressText');
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = '0/10 Soal Terjawab';
    
    // Hide result
    const resultDiv = document.getElementById('quizResult');
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';
    
    // Reset navigation to first question
    currentQuestion = 1;
    showQuestion(currentQuestion);
    updateNavigationButtons();
    
    // Scroll to top of quiz
    const quiz = document.querySelector('#content7 h2');
    if (quiz) quiz.scrollIntoView({behavior: 'smooth'});
}

// Custom Alert Modal
function showCustomAlert(message) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'customAlertOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    // Create alert box
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        text-align: center;
        animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    // Create icon
    const icon = document.createElement('div');
    icon.style.cssText = `
        font-size: 4em;
        margin-bottom: 20px;
    `;
    icon.textContent = '⚠️';

    // Create message
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        font-size: 1.2em;
        color: #2c3e50;
        line-height: 1.6;
        margin-bottom: 30px;
        font-weight: 600;
    `;
    messageDiv.innerHTML = message.replace(/\n/g, '<br>');

    // Create OK button
    const okButton = document.createElement('button');
    okButton.textContent = 'OK, Saya Mengerti';
    okButton.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 40px;
        border-radius: 12px;
        font-size: 1.1em;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    `;

    okButton.onmouseover = () => {
        okButton.style.transform = 'translateY(-3px) scale(1.05)';
        okButton.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.5)';
    };

    okButton.onmouseout = () => {
        okButton.style.transform = 'translateY(0) scale(1)';
        okButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    };

    okButton.onclick = () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    };

    // Assemble alert box
    alertBox.appendChild(icon);
    alertBox.appendChild(messageDiv);
    alertBox.appendChild(okButton);
    overlay.appendChild(alertBox);

    // Add to document
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        }
    };
}
