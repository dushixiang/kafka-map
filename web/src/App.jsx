import React, {Component} from 'react';
import './App.css';
import 'antd/dist/reset.css';
import {Button, ConfigProvider, Dropdown, Layout, Menu, Tooltip} from 'antd';
import {Link, Outlet} from 'react-router-dom';
import {NT_PACKAGE} from "./utils/utils.jsx";
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import zh_CN from './locales/zh_CN';
import en_US from './locales/en_US';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/zh-cn';
import {FormattedMessage, IntlProvider} from 'react-intl';
import request from "./common/request";
import {
    GithubOutlined
} from '@ant-design/icons';

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

        const langItems = [
            {
                label: <a href="/#" onClick={() => {
                    this.setLocale('zh-cn');
                }}>
                    简体中文
                </a>,
                key: 'zh-cn'
            },
            {
                label: <a href="/#" onClick={() => {
                    this.setLocale('en-us');
                }}>
                    English
                </a>,
                key: 'en-us'
            },
        ];

        const infoItems = [
            {
                label: <Link to={`/info`}>
                    <FormattedMessage id="change-password"/>
                </Link>,
                key: 'info'
            },
            {
                label: <a href="/#" onClick={() => {
                    this.logout();
                }}>
                    <FormattedMessage id="logout"/>
                </a>,
                key: 'logout'
            },
        ];

        let messages = {}
        messages['en-us'] = en_US;
        messages['zh-cn'] = zh_CN;

        return (
            <IntlProvider locale={this.state.locale} messages={messages[this.state.locale]}>
                <ConfigProvider locale={this.getAntDesignLocale(this.state.locale)}>
                    <Layout style={{minHeight: '100vh'}}>
                        <Header className="header">
                            <div className='km-header'>
                                <div style={{flex: '1 1 0%'}}>
                                    <Link to={'/'}>
                                        <span className='km-header-logo'>Kafka Map</span>
                                    </Link>
                                </div>
                                <div className='km-header-right'>
                                    <Dropdown menu={{items: infoItems}}>
                                                <span className={'km-header-right-item'}>
                                                    {this.state.info.username}
                                                </span>
                                    </Dropdown>
                                </div>
                                <div className='km-header-right'>
                                    <Dropdown menu={{items: langItems}}>
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
                                                        <Button type="text" style={{color: 'white'}}
                                                                href='https://github.com/dushixiang/kafka-map'
                                                                icon={<GithubOutlined/>}>

                                                        </Button>
                                                      </Tooltip>
                                                </span>
                                </div>
                            </div>
                        </Header>
                        <Content className='km-container'>
                            <Layout>
                                <Content>
                                    <Outlet/>
                                </Content>
                            </Layout>
                        </Content>
                        <Footer style={{textAlign: 'center'}}>kafka map ©2021 Created by dushixiang
                            Version:{this.state.package['version']}</Footer>
                    </Layout>
                </ConfigProvider>
            </IntlProvider>

        );
    }

}

export default App;
