import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {createHashRouter, RouterProvider} from "react-router-dom";
import {routers} from "./router";
import {QueryClient, QueryClientProvider} from 'react-query';

const router = createHashRouter(routers);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>

    </React.StrictMode>
)
