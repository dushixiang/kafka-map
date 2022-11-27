import App from "./App";
import React from "react";
import Login from "./components/Login";
import Cluster from "./components/Cluster.jsx";
import Topic from "./components/Topic.jsx";
import Broker from "./components/Broker.jsx";
import ConsumerGroup from "./components/ConsumerGroup.jsx";
import ConsumerGroupInfo from "./components/ConsumerGroupInfo.jsx";
import TopicInfo from "./components/TopicInfo.jsx";
import TopicData from "./components/TopicData.jsx";
import TopicDataLive from "./components/TopicDataLive.jsx";
import Info from "./components/Info.jsx";

export const routers = [
    {
        path: "/",
        element: <App/>,
        // errorElement: <ErrorPage/>,
        children: [
            {
                // errorElement: <ErrorPage/>,
                children: [
                    {
                        index: true,
                        path: "/",
                        element: <Cluster/>,
                    },
                    {
                        path: "/topic",
                        element: <Topic/>,
                    },
                    {
                        path: "/broker",
                        element: <Broker/>,
                    },
                    {
                        path: "/consumer-group",
                        element: <ConsumerGroup/>,
                    },
                    {
                        path: "/consumer-group-info",
                        element: <ConsumerGroupInfo/>,
                    },
                    {
                        path: "/topic-info",
                        element: <TopicInfo/>,
                    },
                    {
                        path: "/topic-data",
                        element: <TopicData/>,
                    },
                    {
                        path: "/topic-data-live",
                        element: <TopicDataLive/>,
                    },
                    {
                        path: "/info",
                        element: <Info/>,
                    },
                ]
            }
        ]
    },
    {
        path: '/login',
        element: <Login/>
    }
]