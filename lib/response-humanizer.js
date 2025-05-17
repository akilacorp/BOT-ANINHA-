class ResponseHumanizer {    constructor() {
        this.settings = {
            typoRate: 0.0,
            correctionRate: 0.05,
            repetitionRate: 0.02,
            delayPerCharacter: {
                min: 30,
                max: 60
            },
            initialDelay: {
                min: 300,
                max: 1500
            },            personalTicks: [
                "vei", "slc", "pqp", "caralho", 
                "mds", "credo", "socorro", "tendi", "bruh",
                "pior", "surreal", "absurdo", "cringe", "f",
                "lol", "gzuis", "wtf", "nem fudendo", "morta",
                "sefuder", "psicopata", "obscuro", "sinistro", "proibidão",
                "bizarro", "surtei", "foda", "tenso", "papo reto",
                "mlk", "mano", "doidera", "pistolei", "fiquei??"
            ],
            emojiRate: 0.0
        };
          this.commonTypos = {
            'a': ['s', 'q', 'z'],
            'b': ['v', 'n', 'h'],
            'c': ['v', 'x', 'd'],
            'd': ['s', 'f', 'e'],
            'e': ['w', 'r', 'd'],
            'f': ['d', 'g', 'r'],
            'g': ['f', 'h', 't'],
            'h': ['g', 'j', 'y'],
            'i': ['u', 'o', 'k'],
            'j': ['h', 'k', 'u'],
            'k': ['j', 'l', 'i'],
            'l': ['k', 'ç', 'o'],
            'm': ['n', 'b'],
            'n': ['m', 'b'],
            'o': ['i', 'p', 'l'],
            'p': ['o', '[', 'ç'],
            'q': ['w', 'a'],
            'r': ['e', 't', 'f'],
            's': ['a', 'd', 'w'],
            't': ['r', 'y', 'g'],
            'u': ['y', 'i', 'j'],
            'v': ['c', 'b'],
            'w': ['q', 'e', 's'],
            'x': ['z', 'c'],
            'y': ['t', 'u', 'h'],
            'z': ['a', 'x']
        };
    }    calculateTypingTime(message) {
        const length = message.length;
        const baseTime = this.getRandomInRange(
            this.settings.initialDelay.min,
            this.settings.initialDelay.max
        );
        
        const charsTime = length * this.getRandomInRange(
            this.settings.delayPerCharacter.min,
            this.settings.delayPerCharacter.max
        );
        
        if (length < 10) {
            return baseTime + charsTime + this.getRandomInRange(300, 1500);
        }
        
        return baseTime + charsTime;
    }    addTypos(message) {
        if (!message || message.length < 3) return message;
        
        const words = message.split(' ');
        const result = [];
        
        for (const word of words) {
            if (word.length > 2 && Math.random() < this.settings.typoRate) {
                const errorType = Math.random();
                  if (errorType < 0.33) {
                    const pos = Math.floor(Math.random() * word.length);
                    const char = word.charAt(pos).toLowerCase();
                    if (this.commonTypos[char]) {
                        const replacement = this.commonTypos[char][Math.floor(Math.random() * this.commonTypos[char].length)];
                        result.push(word.substring(0, pos) + replacement + word.substring(pos + 1));
                    } else {
                        result.push(word);
                    }                } else if (errorType < 0.66) {
                    const pos = Math.floor(Math.random() * word.length);
                    result.push(word.substring(0, pos) + word.substring(pos + 1));
                } else {
                    const pos = Math.floor(Math.random() * word.length);
                    const char = word.charAt(pos);
                    result.push(word.substring(0, pos) + char + char + word.substring(pos + 1));
                }
                
                if (Math.random() < this.settings.correctionRate) {
                    result.push('*' + word + '*');
                }
            } else {
                result.push(word);
            }
        }
        
        return result.join(' ');
    }    addRepetitions(message) {
        if (!message || message.length < 5 || Math.random() > this.settings.repetitionRate) {
            return message;
        }
        
        const words = message.split(' ');
        
        if (words.length < 3) return message;
        
        const pos = Math.floor(Math.random() * (words.length - 2)) + 1;
        const wordToRepeat = words[pos];
        
        words.splice(pos + 1, 0, wordToRepeat);
        
        return words.join(' ');
    }    addPersonalTicks(message) {        if (!message || message.length < 5 || Math.random() > 0.35) {
            return message;
        }
        
        const expressionTypes = {
            humor: ["slc", "pqp", "caralho", "credo", "socorro", "bruh", "lol", "wtf", "nem fudendo"],
            psicopata: ["surtei", "psicopata", "obscuro", "sinistro", "bizarro", "fiquei??", "morta"],
            internet: ["cringe", "f", "lol", "bruh", "proibidão", "papo reto"],
            normais: ["vei", "mds", "tendi", "pior", "foda", "tenso", "mano"]
        };
                let expressionPool;
        
        if (message.length < 10) {
            expressionPool = Math.random() < 0.7 ? 
                expressionTypes.humor : 
                Math.random() < 0.5 ? expressionTypes.psicopata : expressionTypes.internet;
        } else {
            expressionPool = Math.random() < 0.4 ? 
                expressionTypes.normais : 
                Math.random() < 0.5 ? expressionTypes.humor : expressionTypes.internet;
        }
        
        const randomTick = expressionPool[
            Math.floor(Math.random() * expressionPool.length)
        ];
          if (message.length > 22) {
            return message;
        }
        
        if (Math.random() < 0.6) {
            return `${randomTick} ${message}`;
        } else {
            return `${message} ${randomTick}`;
        }
    }    limitResponseLength(message) {
        if (message.length > 100) {
            let cutPoint = message.substring(0, 100).lastIndexOf('.');
            
            if (cutPoint <= 0) {
                cutPoint = message.substring(0, 100).lastIndexOf(' ');
            }
            
            if (cutPoint <= 0) cutPoint = 100;
            
            let result = message.substring(0, cutPoint + 1);
            
            const lastWord = result.split(' ').pop();
            if (lastWord && (lastWord.length <= 2 || 
                ['que', 'de', 'do', 'da', 'se', 'em', 'no', 'na', 'para', 'com', 'por', 'e', 'ou', 'mas'].includes(lastWord.toLowerCase()))) {
                result = result.substring(0, result.lastIndexOf(' '));
            }
            
            if (!/[.!?]$/.test(result)) {
                result += '.';
            }
            
            return result;
        }
        return message;
    }    removeFormalPunctuation(message) {
        let result = message.replace(/\.$/, '');
        result = result.replace(/["""]/g, '');
        
        const laughTypes = [
            ' kk', ' kkk', ' ksksk', ' ksksks', ' kjkjk', 
            ' kkkj', ' KKKKKK', ' lol', ' KKKKJ', ' MDSKKK'
        ];
        
        const darkHumorPunct = ['!', '!!', '...', '???', '!?'];
        
        if (!result.match(/[!?.,]$/)) {
            if (Math.random() < 0.3) {
                const selectedLaugh = laughTypes[Math.floor(Math.random() * laughTypes.length)];
                result += selectedLaugh;
            } 
            else if (Math.random() < 0.2) {
                const selectedPunct = darkHumorPunct[Math.floor(Math.random() * darkHumorPunct.length)];
                result += selectedPunct;
            }
        }
        
        return result;
    }fixIncompleteWords(message) {        const corrections = {
            'iss': 'isso',
            'vmg': 'vamos',
            'cmg': 'comigo',
            'iai': 'e aí',
            'n t': 'não tô',
            'n s': 'não sei',
            ' n ': ' não ',
            'td': 'tudo',
            'ss ': 'sim ',
            'aq ': 'aqui ',
            
            ' tô ': ' estou ',
            ' tá ': ' está ',
            ' tamo': ' estamos ',
            ' qdo': ' quando ',
            
            ' q ': ' que ',
            ' pq ': ' porque ',
            'vc': 'você',
            ' p ': ' para ',
            ' pra ': ' para ',
            ' c ': ' com ',
            ' d ': ' de ',
            ' tb ': ' também ',
            'cmg': 'comigo',
            'ctg': 'contigo',
            'qlqr': 'qualquer',
            
            'mt ': 'muito ',
            ' mto': ' muito',
            'tmb': 'também',
            'msm': 'mesmo',
            'dms': 'demais',
            
            'vlw': 'valeu',
            'blz': 'beleza',
            'mds': 'meu deus',
            'slk': 'slc',
            'flw': 'falou',
            'rs': 'risos',
            'sdds': 'saudades',
            'fds': 'fim de semana',
            
            'oq': 'o que',
            'ctz': 'certeza',
            'bjo': 'beijo',
            'abs': 'abraço',
            'obg': 'obrigado',
            
            'tbm': 'também',
            'qnt': 'quanto',
            'qnd': 'quando',
            'ngm': 'ninguém'
        };
          let result = message;
        
        Object.keys(corrections).forEach(abbr => {
            result = result.replace(new RegExp(abbr, 'g'), corrections[abbr]);
        });
        
        const words = result.split(' ');
        const lastWord = words[words.length - 1];
        
        if (lastWord && lastWord.length <= 2 && lastWord !== 'tá' && lastWord !== 'né') {
            words.pop();
            result = words.join(' ');
        }
        
        return result;
    }
      isSentenceComplete(sentence) {
        const incompleteEndings = ['que', 'de', 'do', 'da', 'se', 'em', 'no', 'na', 'para', 'com', 'por', 'e', 'ou', 'mas', 
            'quando', 'como', 'pois', 'porque', 'onde'];
            
        const cleanSentence = sentence.trim().replace(/[.,!?]+$/, '');
        const words = cleanSentence.split(' ');
        
        if (words.length === 0) return false;
        
        const lastWord = words[words.length - 1].toLowerCase();
        return !incompleteEndings.includes(lastWord);
    }    completeSentenceIfNeeded(sentence) {
        if (!sentence || sentence.length === 0) return "Tá bom";
        
        if (this.isSentenceComplete(sentence)) return sentence;
        
        const words = sentence.trim().replace(/[.,!?]+$/, '').split(' ');
        if (words.length === 0) return "Tá bom";
        
        if (['eu', 'você', 'vc', 'ele', 'ela', 'a gente', 'nós'].includes(words[words.length - 1].toLowerCase())) {
            const completions = ["também", "sei", "acho", "quero", "vou"];
            const selected = completions[Math.floor(Math.random() * completions.length)];
            return `${sentence} ${selected}`;
        }
        
        const lastWord = words[words.length - 1].toLowerCase();
        const incompleteEndings = ['que', 'de', 'do', 'da', 'se', 'em', 'no', 'na', 'para', 'com', 'por', 'e', 'ou', 'mas', 
            'quando', 'como', 'pois', 'porque', 'onde'];
            
        if (incompleteEndings.includes(lastWord)) {
            const completions = {
                'que': ['isso', 'eu sei', 'tá legal', 'eu falei'],
                'de': ['verdade', 'boa', 'mim', 'nada'],
                'do': ['jeito que é', 'mesmo', 'nada'],
                'da': ['hora', 'melhor forma', 'vida'],
                'se': ['liga', 'quiser', 'for'],
                'em': ['casa', 'geral', 'todo lugar'],
                'no': ['final', 'geral', 'lugar'],
                'na': ['real', 'moral', 'boa'],
                'para': ['mim', 'você', 'de vez'],
                'com': ['certeza', 'você', 'isso'],
                'por': ['enquanto', 'aí', 'hoje'],
                'e': ['tal', 'pronto', 'acabou'],
                'ou': ['não', 'tanto faz', 'sei lá'],
                'mas': ['tudo bem', 'deixa pra lá', 'relaxa'],
                'quando': ['quiser', 'der', 'puder'],
                'como': ['sempre', 'você quiser', 'eu falei'],
                'pois': ['é', 'então', 'né'],
                'porque': ['sim', 'eu quero', 'faz sentido'],
                'onde': ['você tá', 'eu tô', 'der']
            };
            
            const possibleCompletions = completions[lastWord] || ['isso', 'né', 'assim'];
            const selected = possibleCompletions[Math.floor(Math.random() * possibleCompletions.length)];
            return `${sentence} ${selected}`;
        }
        
        return sentence;
    }
      humanizeResponse(originalResponse) {
        if (!originalResponse || typeof originalResponse !== 'string') {
            return "Não entendi, me fala de novo?";
        }
        
        let response = this.limitResponseLength(originalResponse.trim());
        
        response = this.fixIncompleteWords(response);
        
        response = this.completeSentenceIfNeeded(response);
        
        if (!/[.!?]$/.test(response)) {
            const rand = Math.random();
            if (rand < 0.7) {
                response = response + ".";
            } else if (rand < 0.9) {
                response = response + "!";
            } else {
                response = response + "?";
            }
        }
        
        response = this.removeFormalPunctuation(response);
        
        const hasStrongExpression = response.toLowerCase().includes('pqp') || 
                                    response.toLowerCase().includes('caralho') ||
                                    response.toLowerCase().includes('foda');
                                    
        if (!hasStrongExpression) {
            if (Math.random() < 0.45) {
                response = this.addPersonalTicks(response);
            }
        } else {
            if (Math.random() < 0.15) {
                response = this.addPersonalTicks(response);
            }
        }
        
        if (Math.random() < 0.05) response = this.addTypos(response);
        if (Math.random() < 0.02) response = this.addRepetitions(response);
        
        if (!response.startsWith("Eu") && Math.random() < 0.7) {
            response = response.toLowerCase();
        }
        
        if (response.length > 0) {
            if (!/[.!?]$/.test(response)) {
                response += ".";
            }
            
            const lastWord = response.split(' ').pop().replace(/[.!?,;]$/, '');
            if (lastWord && lastWord.length <= 2 && !['tá', 'né', 'já', 'só', 'pô', 'eu', 'te'].includes(lastWord)) {
                response += " né";
            }
        }
        
        return response;
    }    getRandomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = new ResponseHumanizer();
