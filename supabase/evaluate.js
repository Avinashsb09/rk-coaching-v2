const wsUrl = 'ws://127.0.0.1:11414/devtools/page/5E5B0451D82AA4A145BE9F82C0E8DCC6';

const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log('Connected to DevTools WebSocket');
  
  // Evaluate localStorage
  const message = {
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: '(() => { return JSON.stringify(window.localStorage); })()'
    }
  };
  ws.send(JSON.stringify(message));
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  if (response.id === 1) {
    console.log('Evaluation Result:', response.result?.result?.value);
    ws.close();
  }
};

ws.onerror = (err) => {
  console.error('WebSocket Error:', err);
};
