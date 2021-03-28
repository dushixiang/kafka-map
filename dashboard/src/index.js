import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import zhCN from 'antd/es/locale-provider/zh_CN';
import {ConfigProvider} from 'antd';
import {HashRouter as Router} from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

ReactDOM.render(
    <React.StrictMode>
        <ConfigProvider locale={zhCN}>
            <Router>
                <App/>
            </Router>
        </ConfigProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
