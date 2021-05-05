import React, {Component} from 'react';
import request from "../common/request";
import {List} from "antd";

class TopicConfig extends Component {

    state = {
        loading: false,
        items: [],
    }

    componentDidMount() {
        let clusterId = this.props.clusterId;
        let topic = this.props.topic;
        this.loadItems(clusterId, topic);
    }

    async loadItems(clusterId, topic) {
        this.setState({
            loading: true
        })
        let items = await request.get(`/topics/${topic}/configs?clusterId=${clusterId}`);
        this.setState({
            items: items,
            loading: false
        })
    }

    render() {

        return (
            <div>
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.items}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={item['name']}
                                description={item['value']}
                            />
                        </List.Item>
                    )}
                />
            </div>
        );
    }
}

export default TopicConfig;