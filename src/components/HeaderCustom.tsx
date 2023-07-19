import { Layout } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
const { Header } = Layout;

type HeaderCustomProps = {
    toggle: () => void;
    collapsed: boolean;
    user: any;
    responsive?: any;
    path?: string;
};

const HeaderCustom = (props: HeaderCustomProps) => {
    return (
        <Header className="custom-theme header">
            {props.collapsed ? (
                <MenuUnfoldOutlined
                    className="header__trigger custom-trigger"
                    onClick={props.toggle}
                />
            ) : (
                <MenuFoldOutlined
                    className="header__trigger custom-trigger"
                    onClick={props.toggle}
                />
            )}
        </Header>
    );
};

export default HeaderCustom;
