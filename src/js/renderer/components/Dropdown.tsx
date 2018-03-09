import * as React from "react";

export default class Dropdown extends React.Component<{items: {name}[], onChange: (e) => void, selected?: number}, {open: boolean, selected: number, items: {name}[]}> {
    private _div: HTMLDivElement;

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            selected: 0,
            items: []
        }
    }

    render() {
        return (
            <div className={"dropdown" + (this.state.open == true ? ' open':'')} onClick={(e) => {this.setState({open: !this.state.open})}} ref={div => this._div = div}>
                {this.state.items.map(({name}, key) => {
                    return <div className={"item"+(this.state.selected == key ? ' active' : '')} key={key} onClick={this.select.bind(this, key)}>{name}</div>
                })}
                <i className="fa fa-caret-down"/>
            </div>
        );
    }

    componentDidMount() {
        this.setState({items: this.props.items, selected: !!this.props.selected ? this.props.selected : 0});        
        document.body.addEventListener("click", (e: MouseEvent) => {
            var t = e.target as HTMLDivElement;
            if(t !== this._div && t.parentElement && t.parentElement !== this._div) {
                setTimeout(() => {
                    this.setState({open: false});
                }, 50);
            }
        })
    }

    select = (key) => {
        console.log(key);
        this.props.onChange(key);
        this.setState({selected: key});
    }

    componentWillReceiveProps({items, selected = 0}) {
        this.setState({items, selected});
    }
}