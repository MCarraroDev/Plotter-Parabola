$(document).ready(function() {
    $('#parabola-form').on('submit', function(e) {
      e.preventDefault();
      
      // Ottieni i valori dei coefficienti
      const a = eval($('#a').val());
      const b = eval($('#b').val());
      const c = eval($('#c').val());
      
      if (a === 0) {
        alert("Il coefficiente 'a' non può essere 0 in una parabola.");
        return;
      }
      
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
        font: {
          color: '#e5e7eb'
        },
        xaxis: { 
          title: 'x',
          gridcolor: '#374151',
          zerolinecolor: '#4b5563',
          tickfont: { color: '#e5e7eb' }
        },
        yaxis: { 
          title: 'y',
          gridcolor: '#374151',
          zerolinecolor: '#4b5563',
          tickfont: { color: '#e5e7eb' }
        }
      };
      
      Plotly.newPlot('plot', data, layout);
      
      // Calcola le informazioni della parabola
      const vertex = { x: xv, y: yv };
      const yIntercept = { x: 0, y: c };
      
      // Calcola le intersezioni con l'asse x (soluzione dell'equazione quadratica)
      let xIntercepts = [];
      const discriminante = b * b - 4 * a * c;
      if (discriminante > 0) {
        const root1 = (-b + Math.sqrt(discriminante)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminante)) / (2 * a);
        xIntercepts.push(root1, root2);
      } else if (discriminante === 0) {
        xIntercepts.push(-b / (2 * a));
      }
      
      // Punti "comodi": genera punti con valori interi o con .5 intorno al vertice
      let convenientPoints = [];
      const startConvenient = Math.floor(xv) - 5;
      const endConvenient = Math.floor(xv) + 5;
      for(let i = startConvenient; i <= endConvenient; i++) {
        [i, i + 0.5].forEach(x => {
          if (!convenientPoints.find(pt => pt.x === x)) {
            convenientPoints.push({ x: x, y: a * x * x + b * x + c });
          }
        });
      }
      convenientPoints.sort((p1, p2) => p1.x - p2.x);
      
      // Mostra le informazioni nella tabella
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
      
      // Mostra i "punti comodi" in una riga separata
      const firstPoints = convenientPoints.slice(0, 5);
      const lastPoints = convenientPoints.slice(-5);
      
      const $convDiv = $('<div>', { class: 'convenient-points' })
        .append($('<strong>').text('Primi 5 punti:'))
        .append('<br>')
        .append(firstPoints.map(pt => `(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`).join(' - '))
        .append('<br>')
        .append($('<strong>').text('Ultimi 5 punti:'))
        .append('<br>')
        .append(lastPoints.map(pt => `(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`).join(' - '));
      
      $('<tr>')
        .append($('<td>', { colspan: 2 }).append($convDiv))
        .appendTo($tableBody);
    });
  });
  