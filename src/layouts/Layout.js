import React from "react";
import { Layout as AntLayout } from "antd";
import { Outlet } from "react-router-dom";
import { Header, Footer } from "../components";

const { Content } = AntLayout;

function Layout() {
  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header />
      <Content style={{ flex: 1, paddingTop: "50px" }}>
        <Outlet />
      </Content>
      <Footer />
    </AntLayout>
  );
}

export default Layout;
