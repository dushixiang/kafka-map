import React, {Component} from 'react';
import 'antd/dist/antd.css';
import './App.css';
import {Button, ConfigProvider, Dropdown, Layout, Menu, Tooltip} from 'antd';
import {Link, Route, Switch} from 'react-router-dom';
import Cluster from "./components/Cluster";
import Topic from "./components/Topic";
import TopicInfo from "./components/TopicInfo";
import TopicData from "./components/TopicData";
import Broker from "./components/Broker";
import ConsumerGroup from "./components/ConsumerGroup";
import ConsumerGroupInfo from "./components/ConsumerGroupInfo";
import {NT_PACKAGE} from "./utils/utils";
import zhCN from "antd/es/locale-provider/zh_CN";
import enUS from "antd/es/locale-provider/en_US";
import zh_CN from './locales/zh_CN';
import en_US from './locales/en_US';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/zh-cn';
import {IntlProvider} from 'react-intl';
import Login from "./components/Login";
import request from "./common/request";
import {
    GithubOutlined
} from '@ant-design/icons';
import Info from "./components/Info";

const {Header, Content, Footer} = Layout;

dayjs.extend(relativeTime);

class App extends Component {

    state = {
        package: NT_PACKAGE(),
        locale: 'en-us',
        info: {
            username: ''
        }
    }

    componentDidMount() {
        let locale = localStorage.getItem('locale');
        if (!locale) {
            locale = 'en-us';
        }
        dayjs.locale(locale);
        this.setState({
            locale: locale
        })
        this.loadUserInfo();
    }

    setLocale = (locale) => {
        localStorage.setItem('locale', locale);
        window.location.reload();
    }

    getAntDesignLocale = (locale) => {
        switch (locale) {
            case 'en-us':
                return enUS;
            case 'zh-cn':
                return zhCN;
            default:
                return undefined;
        }
    }

    loadUserInfo = async () => {
        let info = await request.get('/info');
        this.setState({
            info: info
        })
    }

    logout = async () => {
        await request.post('/logout');
        window.location.reload();
    }

    render() {

        const menu = (
            <Menu>
                <Menu.Item>
                    <a href="/#" onClick={() => {
                        this.setLocale('zh-cn');
                    }}>
                        简体中文
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a href="/#" onClick={() => {
                        this.setLocale('en-us');
                    }}>
                        English
                    </a>
                </Menu.Item>
            </Menu>
        );

        const infoMenu = (
            <Menu>
                <Menu.Item>
                    <Link to={`/info`}>
                        修改密码
                    </Link>
                </Menu.Item>
                <Menu.Item>
                    <a href="/#" onClick={() => {
                        this.logout();
                    }}>
                        退出登录
                    </a>
                </Menu.Item>
            </Menu>
        );

        let messages = {}
        messages['en-us'] = en_US;
        messages['zh-cn'] = zh_CN;

        return (
            <IntlProvider locale={this.state.locale} messages={messages[this.state.locale]}>
                <ConfigProvider locale={this.getAntDesignLocale(this.state.locale)}>
                    <div className="App">
                        <Switch>
                            <Route path="/login" component={Login}/>
                            <Route>
                                <Layout style={{minHeight: '100vh'}}>
                                    <Header className="header">
                                        <div className='km-header'>
                                            <div style={{flex: '1 1 0%'}}>
                                                <Link to={'/'}>
                                                    <span className='km-header-logo'>Kafka Map</span>
                                                </Link>
                                            </div>
                                            <div className='km-header-right'>
                                                <Dropdown overlay={infoMenu}>
                                                <span className={'km-header-right-item'}>
                                                    {this.state.info.username}
                                                </span>
                                                </Dropdown>
                                            </div>
                                            <div className='km-header-right'>
                                                <Dropdown overlay={menu}>
                                                <span className={'km-header-right-item'}>
                                                    <i className="anticon">
                                                        <svg viewBox="0 0 24 24" focusable="false" width="1em"
                                                             height="1em"
                                                             fill="currentColor" aria-hidden="true">
                                                            <path d="M0 0h24v24H0z" fill="none"/>
                                                            <path
                                                                d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z "
                                                                className="css-c4d79v"/>
                                                        </svg>
                                                    </i>
                                                </span>
                                                </Dropdown>
                                            </div>

                                            <div className='km-header-right'>
                                                <span className={'km-header-right-item'}>
                                                    <Tooltip title="star">
                                                        <Button type="text" style={{color: 'white'}} href='https://github.com/dushixiang/kafka-map' icon={<GithubOutlined/>}>

                                                        </Button>
                                                      </Tooltip>
                                                </span>
                                            </div>
                                        </div>
                                    </Header>
                                    <Content className='km-container'>
                                        <Layout>
                                            <Content>
                                                <Route path="/" exact component={Cluster}/>
                                                <Route path="/topic" component={Topic}/>
                                                <Route path="/broker" component={Broker}/>
                                                <Route path="/consumer-group" component={ConsumerGroup}/>
                                                <Route path="/consumer-group-info" component={ConsumerGroupInfo}/>
                                                <Route path="/topic-info" component={TopicInfo}/>
                                                <Route path="/topic-data" component={TopicData}/>
                                                <Route path="/info" component={Info}/>
                                            </Content>
                                        </Layout>
                                    </Content>
                                    <Footer style={{textAlign: 'center'}}>kafka map ©2021 Created by dushixiang
                                        Version:{this.state.package['version']}</Footer>
                                </Layout>
                            </Route>
                        </Switch>

                    </div>
                </ConfigProvider>
            </IntlProvider>

        );
    }

}

export default App;
