document.addEventListener('DOMContentLoaded', () => {
    const blocksContainer = document.getElementById('blocksContainer');
    const addBlockBtn = document.getElementById('addBlockBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const trimBtn = document.getElementById('trimBtn');
    const themeToggle = document.getElementById('themeToggle');
    const grandTotal = document.getElementById('grandTotal');
    
    // Stats elements
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const sentenceCount = document.getElementById('sentenceCount');
    const paragraphCount = document.getElementById('paragraphCount');
    const charNoSpace = document.getElementById('charNoSpace');
    const topWord = document.getElementById('topWord');
    const byteCount = document.getElementById('byteCount');

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme', !isDark);
        document.getElementById('sunIcon').classList.toggle('hidden', isDark);
        document.getElementById('moonIcon').classList.toggle('hidden', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.replace('light-theme', 'dark-theme');
        document.getElementById('sunIcon').classList.add('hidden');
        document.getElementById('moonIcon').classList.remove('hidden');
    }

    let blockCounter = 1;

    const createBlock = (idNum) => {
        const block = document.createElement('div');
        block.className = 'block-item';
        block.id = `block-${idNum}`;
        block.innerHTML = `
            <div class="block-header">
                <span class="block-num">Block #${idNum}</span>
                <div class="block-stats">
                    <span>Chars: <span class="block-char-count">0</span></span>
                    <button class="remove-block" onclick="this.closest('.block-item').remove(); window.updateStats();">×</button>
                </div>
            </div>
            <textarea class="text-input" placeholder="Start typing block #${idNum}..." spellcheck="false"></textarea>
        `;
        
        const textarea = block.querySelector('textarea');
        textarea.addEventListener('input', () => updateStats());
        return block;
    };

    const updateStats = () => {
        const textareas = document.querySelectorAll('.text-input');
        let totalChars = 0;
        let totalWords = 0;
        let totalSentences = 0;
        let totalParagraphs = 0;
        let totalNoSpace = 0;
        let combinedText = "";

        textareas.forEach(ta => {
            const text = ta.value;
            const chars = [...text].length;
            totalChars += chars;
            combinedText += text + " ";
            
            // Update individual block count
            const blockItem = ta.closest('.block-item');
            blockItem.querySelector('.block-char-count').innerText = chars.toLocaleString();

            // Word count
            const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
            totalWords += words.length;

            // Sentences
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            totalSentences += sentences.length;

            // Paragraphs
            const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
            totalParagraphs += paragraphs.length;

            // No space
            totalNoSpace += [...text.replace(/\s/g, '')].length;
        });

        // Update Grand Totals
        grandTotal.innerText = totalChars.toLocaleString();
        charCount.innerText = totalChars.toLocaleString();
        wordCount.innerText = totalWords.toLocaleString();
        sentenceCount.innerText = totalSentences.toLocaleString();
        paragraphCount.innerText = totalParagraphs.toLocaleString();
        charNoSpace.innerText = totalNoSpace.toLocaleString();
        byteCount.innerText = new TextEncoder().encode(combinedText).length.toLocaleString();

        // Top Word calculation on combined text
        updateTopWord(combinedText);

        // Hide remove button if only one block remains
        const removeBtns = document.querySelectorAll('.remove-block');
        removeBtns.forEach(btn => btn.classList.toggle('hidden', removeBtns.length === 1));
    };

    const updateTopWord = (text) => {
        const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
        if (words.length === 0) {
            topWord.innerText = '-';
            return;
        }
        const freq = {};
        words.forEach(w => {
            const word = w.toLowerCase().replace(/[^a-zA-Z\u00C0-\u017F]/g, '');
            if (word.length > 3) {
                freq[word] = (freq[word] || 0) + 1;
            }
        });
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        topWord.innerText = sorted.length > 0 ? `${sorted[0][0]} (${sorted[0][1]}x)` : '-';
    };

    // Export updateStats to window so inline onclick can access it
    window.updateStats = updateStats;

    addBlockBtn.addEventListener('click', () => {
        blockCounter++;
        const newBlock = createBlock(blockCounter);
        blocksContainer.appendChild(newBlock);
        newBlock.querySelector('textarea').focus();
        updateStats();
    });

    clearBtn.addEventListener('click', () => {
        blocksContainer.innerHTML = '';
        blockCounter = 1;
        blocksContainer.appendChild(createBlock(1));
        updateStats();
    });

    copyBtn.addEventListener('click', () => {
        const textareas = document.querySelectorAll('.text-input');
        const combined = Array.from(textareas).map(ta => ta.value).join('\n\n').trim();
        if (!combined) return;
        
        navigator.clipboard.writeText(combined).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = 'Copied!';
            setTimeout(() => copyBtn.innerText = originalText, 2000);
        });
    });

    trimBtn.addEventListener('click', () => {
        const textareas = document.querySelectorAll('.text-input');
        textareas.forEach(ta => {
            ta.value = ta.value.replace(/\s+/g, ' ').trim();
        });
        updateStats();
    });

    // Initialize listeners for the first block
    document.querySelector('.text-input').addEventListener('input', updateStats);
    updateStats();
});
