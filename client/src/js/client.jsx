import React from "react";
import ReactDOM from "react-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Index from "./pages/Index.jsx";

const app = document.getElementById('app');
ReactDOM.render(
  <div>
    <Header />
    <Index />
    <div class="clearfix"></div>
    <Footer />
  </div>,
app);
