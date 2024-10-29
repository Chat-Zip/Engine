self.onmessage = (e: MessageEvent<Array<string>>) => {
    const urls = e.data;
    fetch(urls[0]).then(response => response.arrayBuffer()).then(data => self.postMessage({fileName: 'px.png', data: data}));
    fetch(urls[1]).then(response => response.arrayBuffer()).then(data => self.postMessage({fileName: 'nx.png', data: data}));
    fetch(urls[2]).then(response => response.arrayBuffer()).then(data => self.postMessage({fileName: 'py.png', data: data}));
    fetch(urls[3]).then(response => response.arrayBuffer()).then(data => self.postMessage({fileName: 'ny.png', data: data}));
    fetch(urls[4]).then(response => response.arrayBuffer()).then(data => self.postMessage({fileName: 'pz.png', data: data}));
    fetch(urls[5]).then(response => response.arrayBuffer()).then(data => self.postMessage({fileName: 'nz.png', data: data}));
}