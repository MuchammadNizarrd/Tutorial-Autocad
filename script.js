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
        q3: 'units',
        q4: 'LA',
        q5: '@210,297',
        q6: 'X',
        q7: 'AR-CONC',
        q8: 'H',
        q9: 'Enter',
        q10: 'F3'
    };

    const form = document.getElementById('quizForm');
    if (!form) return;

    let totalCorrect = 0;
    const perSub = {1:0,2:0,3:0,4:0,5:0};

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
    const topics = ['Pengenalan Icon', 'Unit & Layer', 'Ukuran Kertas', 'Arsiran', 'Persiapan'];
    for (let s = 1; s <= 5; s++) {
        const score = perSub[s];
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
            'Drawing Units',
            'Membuat layer',
            'Format A4',
            'Memecah objek',
            'Pattern beton',
            'Membuat arsiran',
            'Mengulang offset',
            'OSNAP toggle'
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
    
    // Scroll to top of quiz
    const quiz = document.querySelector('#content6 h2');
    if (quiz) quiz.scrollIntoView({behavior: 'smooth'});
}
