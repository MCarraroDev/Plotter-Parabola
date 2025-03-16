$(document).ready(function() {
    // Gestione dello switch della modalità
    $('#mode-toggle').on('change', function() {
        $('body').toggleClass('slider-mode', this.checked);
    });

    // Funzione per aggiornare i valori visualizzati degli slider
    function updateSliderValue(id) {
        const value = $(`#${id}-slider`).val();
        $(`#${id}-value`).text(parseFloat(value).toFixed(1));
        $(`#${id}`).val(value);
    }

    // Funzione per aggiornare gli slider dai campi di testo
    function updateSliderFromText(id) {
        const value = parseFloat($(`#${id}`).val());
        if (!isNaN(value)) {
            $(`#${id}-slider`).val(value);
            $(`#${id}-value`).text(value.toFixed(1));
        }
    }

    // Funzione per disegnare la parabola
    function plotParabola(a, b, c) {
        // Calcola il vertice della parabola
        const xv = -b / (2 * a);
        const yv = a * xv * xv + b * xv + c;
        
        // Definisci l'intervallo per il grafico attorno al vertice
        const range = 10;
        const xStart = xv - range;
        const xEnd = xv + range;
        
        // Genera i punti della parabola
        const xValues = [];
        const yValues = [];
        const step = (xEnd - xStart) / 200;
        for(let x = xStart; x <= xEnd; x += step) {
            xValues.push(x);
            yValues.push(a * x * x + b * x + c);
        }

        // Disegna il grafico con Plotly
        const data = [{
            x: xValues,
            y: yValues,
            mode: 'lines',
            name: 'Parabola',
            line: { color: '#3b82f6', width: 2 }
        }];
        
        const layout = {
            title: 'Grafico della Parabola',
            paper_bgcolor: '#111827',
            plot_bgcolor: '#1f2937',
            font: { color: '#e5e7eb' },
            xaxis: { 
                title: 'x',
                gridcolor: '#374151',
                zerolinecolor: '#ffffff',
                tickfont: { color: '#e5e7eb' },
                scaleanchor: 'y',
                scaleratio: 1,
                fixedrange: false
            },
            yaxis: { 
                title: 'y',
                gridcolor: '#374151',
                zerolinecolor: '#ffffff',
                tickfont: { color: '#e5e7eb' },
                scaleanchor: 'x',
                scaleratio: 1,
                constrain: 'domain',
                fixedrange: false
            }
        };
        
        Plotly.newPlot('plot', data, layout);

        // Aggiorna la tabella delle informazioni
        updateInfoTable(a, b, c, xv, yv);
    }

    // Funzione per aggiornare la tabella delle informazioni
    function updateInfoTable(a, b, c, xv, yv) {
        const vertex = { x: xv, y: yv };
        const yIntercept = { x: 0, y: c };
        
        // Calcola le intersezioni con l'asse x
        let xIntercepts = [];
        const discriminante = b * b - 4 * a * c;
        if (discriminante > 0) {
            const root1 = (-b + Math.sqrt(discriminante)) / (2 * a);
            const root2 = (-b - Math.sqrt(discriminante)) / (2 * a);
            xIntercepts.push(root1, root2);
        } else if (discriminante === 0) {
            xIntercepts.push(-b / (2 * a));
        }
        
        // Genera punti "comodi" per la parabola
        let convenientPoints = [];
        
        // Funzione per calcolare y dato x
        const calcY = x => a * x * x + b * x + c;
        
        // Funzione per aggiungere un punto se non esiste già
        const addPoint = x => {
            const roundedX = Math.round(x * 100) / 100;
            if (!convenientPoints.find(pt => pt.x === roundedX)) {
                convenientPoints.push({ x: roundedX, y: calcY(roundedX) });
            }
        };

        // Aggiungi i vari punti significativi
        addPoint(xv);
        xIntercepts.forEach(x => addPoint(x));
        addPoint(0);
        [-2, -1, 1, 2].forEach(factor => addPoint(xv + factor));

        // Punti dove la parabola interseca valori interi di y
        const yIntersections = [];
        for (let i = Math.floor(yv) - 2; i <= Math.ceil(yv) + 2; i++) {
            if (i !== yv) yIntersections.push(i);
        }

        yIntersections.forEach(y => {
            const k = c - y;
            const disc = b * b - 4 * a * k;
            if (disc >= 0) {
                const x1 = (-b + Math.sqrt(disc)) / (2 * a);
                const x2 = (-b - Math.sqrt(disc)) / (2 * a);
                addPoint(x1);
                if (disc > 0) addPoint(x2);
            }
        });

        [-1.5, -0.5, 0.5, 1.5].forEach(factor => addPoint(xv + factor));

        // Ordina e filtra i punti
        convenientPoints.sort((p1, p2) => p1.x - p2.x);
        convenientPoints = convenientPoints.filter((point, index, array) => {
            if (index === 0) return true;
            return Math.abs(point.x - array[index - 1].x) >= 0.1;
        });

        // Aggiorna la tabella
        const $tableBody = $('#info-table tbody');
        $tableBody.empty();

        function addRow(name, value) {
            $('<tr>')
                .append($('<td>').text(name))
                .append($('<td>').text(value))
                .appendTo($tableBody);
        }

        addRow('Vertice (x)', vertex.x.toFixed(2));
        addRow('Vertice (y)', vertex.y.toFixed(2));
        addRow('Intersezione asse y', `(${yIntercept.x.toFixed(2)}, ${yIntercept.y.toFixed(2)})`);

        if (xIntercepts.length > 0) {
            xIntercepts.forEach((xVal, index) => {
                addRow(`Intersezione asse x ${index + 1}`, `(${xVal.toFixed(2)}, 0)`);
            });
        } else {
            addRow('Intersezione asse x', 'Nessuna intersezione reale');
        }

        const firstPoints = convenientPoints.slice(0, 5);
        const lastPoints = convenientPoints.slice(-5);

        const $convDiv = $('<div>', { class: 'convenient-points' })
            .append($('<strong>').text('Punti Significativi (primi 5):'))
            .append('<br>')
            .append(firstPoints.map(pt => `(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`).join(' - '))
            .append('<br>')
            .append($('<strong>').text('Punti Significativi (ultimi 5):'))
            .append('<br>')
            .append(lastPoints.map(pt => `(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`).join(' - '))
            .append('<br><br>')
            .append($('<small>').text('I punti significativi includono: vertice, intersezioni con gli assi, punti di simmetria e punti con coordinate intere.'));

        $('<tr>')
            .append($('<td>', { colspan: 2 }).append($convDiv))
            .appendTo($tableBody);
    }

    // Funzione principale per aggiornare la parabola
    function updateParabola() {
        // Ottieni i valori dei coefficienti
        const a = parseFloat($('#a').val());
        const b = parseFloat($('#b').val());
        const c = parseFloat($('#c').val());
        
        if (a === 0 && !$('#allow-zero-a').prop('checked')) {
            alert("Il coefficiente 'a' non può essere 0 in una parabola.\nAttiva 'Permetti a=0' per visualizzare una retta.");
            $('#a').val(0.1);
            $('#a-slider').val(0.1);
            $('#a-value').text('0.1');
            return;
        }

        // Se a=0 e lo switch è attivo, mostra una retta
        if (a === 0) {
            const xValues = [-10, 10];
            const yValues = xValues.map(x => b * x + c);
            
            const data = [{
                x: xValues,
                y: yValues,
                mode: 'lines',
                name: 'Retta',
                line: { color: '#3b82f6', width: 2 }
            }];
            
            const layout = {
                title: 'Grafico della Retta',
                paper_bgcolor: '#111827',
                plot_bgcolor: '#1f2937',
                font: { color: '#e5e7eb' },
                xaxis: { 
                    title: 'x',
                    gridcolor: '#374151',
                    zerolinecolor: '#ffffff',
                    tickfont: { color: '#e5e7eb' },
                    scaleanchor: 'y',
                    scaleratio: 1,
                    fixedrange: false
                },
                yaxis: { 
                    title: 'y',
                    gridcolor: '#374151',
                    zerolinecolor: '#ffffff',
                    tickfont: { color: '#e5e7eb' },
                    scaleanchor: 'x',
                    scaleratio: 1,
                    constrain: 'domain',
                    fixedrange: false
                }
            };
            
            Plotly.newPlot('plot', data, layout);

            // Aggiorna la tabella delle informazioni per la retta
            const $tableBody = $('#info-table tbody');
            $tableBody.empty();

            function addRow(name, value) {
                $('<tr>')
                    .append($('<td>').text(name))
                    .append($('<td>').text(value))
                    .appendTo($tableBody);
            }

            addRow('Punto', 'Tipo');
            addRow('', 'Retta');
            addRow('Punto', 'Equazione');
            addRow('', `y = ${b}x + ${c}`);
            addRow('Punto', 'Pendenza');
            addRow('', b.toFixed(2));
            
            // Intersezioni
            addRow('Punto', 'Intersezione asse y');
            addRow('', `(0, ${c.toFixed(2)})`);
            
            addRow('Punto', 'Intersezione asse x');
            if (b !== 0) {
                const xIntercept = -c / b;
                addRow('', `(${xIntercept.toFixed(2)}, 0)`);
            } else {
                addRow('', 'Retta parallela all\'asse x');
            }

            // Punti significativi
            addRow('Punto', 'Punti significativi');
            const points = [];
            for(let x = -2; x <= 2; x++) {
                const y = b * x + c;
                points.push({ x, y });
            }
            addRow('', points.map(pt => `(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`).join('\n'));
            
            return;
        }

        plotParabola(a, b, c);
    }

    // Aggiungi event listener per gli slider
    ['a', 'b', 'c'].forEach(id => {
        // Evento per gli slider
        $(`#${id}-slider`).on('input', function() {
            updateSliderValue(id);
            if ($('#mode-toggle').prop('checked')) {
                updateParabola();
            }
        });

        // Evento per i campi di testo
        $(`#${id}`).on('input', function() {
            updateSliderFromText(id);
        });
    });

    // Gestione del submit del form
    $('#parabola-form').on('submit', function(e) {
        e.preventDefault();
        updateParabola();
    });

    // Disegna la parabola iniziale
    updateParabola();
});
