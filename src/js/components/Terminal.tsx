import React from 'react';
import { Terminal as Term } from 'xterm';
import { spawn } from 'node-pty';
import { ITerminal } from 'node-pty/lib/interfaces';

export default class Terminal extends React.Component {
    container: HTMLDivElement;
    terminal: Term;
    childProcess: ITerminal;
    state = {

    };
    render() {
        return (
            <div ref={container => this.container = container} />
        );
    }

    componentDidMount() {
        this.terminal = new Term();
        this.terminal.open(this.container);
        this.terminal.write("Welcome Humans");
        this.childProcess = spawn("/usr/local/bin/zsh", [], {
            name: 'xterm-color',
            cols: this.terminal.cols,
            rows: this.terminal.rows,
            cwd: process.env.HOME,
            env: process.env
        });
        this.childProcess.on('data', (data) => this.terminal.write(data));
        // this.childProcess.stdout.on('data', (data) => {
        //     console.log(data);
        //     this.terminal.write(data.toString());
        // });
        // this.childProcess.stderr.on('data', (data) => {
        //     console.log(data);
        //     this.terminal.write(data.toString());
        // });
        this.terminal.on('data', (data) => {
            this.childProcess.write(data);
        })
    }

    componentWillUnmount() {
        this.terminal.destroy();
        this.childProcess.kill();
    }
}