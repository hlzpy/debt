import React, { useEffect, useState } from 'react';
import Table, { ColumnsType } from 'antd/es/table';
import { Space, Typography, Modal } from 'antd';
import axios from 'axios';
import DebtDetail from '../DebtDetail';
import DebtEdit from '../DebtEdit';
import TryCalc from '../TryCalc';
const { Text } = Typography;
const { info } = Modal;

export interface DataType {
    name: string;
    totalAmount: number;
    borrowingDate: string;
    repayment: { date: string; amount: number }[];
    node: string;
    id: number;
    rate: number;
}

const DebtList: React.FC = () => {
    const columns: ColumnsType<DataType> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'borrowingDate',
            dataIndex: 'borrowingDate',
            key: 'borrowingDate',
        },
        {
            title: 'totalAmount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            sorter: (a, b) => a.totalAmount - b.totalAmount,
        },
        {
            title: 'repayment',
            key: 'repayment',
            dataIndex: 'repayment',
            render: (_, { repayment }) => (
                <>{repayment.reduce((pre, cur) => +pre + +cur.amount, 0)}</>
            ),
        },
        {
            title: 'result',
            key: 'id',
            dataIndex: 'result',
            render: (_, { repayment, totalAmount }) => {
                return +totalAmount - +repayment.reduce((pre, cur) => +pre + +cur.amount, 0);
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => handleEdit(record)}>edit</a>
                    <a onClick={() => tryCalc(record)}>calc</a>
                </Space>
            ),
        },
    ];
    const [debts, setDebts] = useState<DataType[]>([]);
    const [editingItem, setEditingItem] = useState<DataType | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [tryCalcModalVisible, setTryCalcModalVisible] = useState(false);
    useEffect(() => {
        getList();
    }, []);

    const getList = () => {
        axios
            .get('/data.json')
            .then((response) => {
                setDebts(response?.data);
            })
            .catch((error) => {
                // 在这里处理错误
                console.error(error);
            });
    };

    const handleEdit = (item: DataType) => {
        setEditingItem(item);
        setEditModalVisible(true);
    };

    const tryCalc = (item: DataType) => {
        setEditingItem(item);
        setTryCalcModalVisible(true);
    };

    const handleSave = (values: DataType) => {
        const newData = debts.map((item: DataType) =>
            item.id === editingItem?.id ? { ...item, ...values } : item
        );
        setDebts(newData);
        setEditModalVisible(false);
    };
    return (
        <>
            <div className="mt-4">
                <Table
                    columns={columns}
                    dataSource={debts}
                    pagination={false}
                    summary={(pageData) => {
                        let totalBorrow = 0;
                        let totalRepayment = 0;

                        pageData.forEach(({ totalAmount, repayment }) => {
                            totalBorrow += totalAmount;
                            totalRepayment += repayment.reduce((pre, cur) => pre + cur.amount, 0);
                        });
                        const totalResult = totalBorrow - totalRepayment;

                        return (
                            <>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                                    <Table.Summary.Cell index={2}>
                                        <Text type="danger">{totalBorrow}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3}>
                                        <Text>{totalRepayment}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={4}>
                                        <Text>{totalResult}</Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </>
                        );
                    }}
                />
            </div>
            <DebtEdit
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onSave={handleSave}
                editingItem={editingItem}
            />
            <TryCalc
                visible={tryCalcModalVisible}
                onCancel={() => setTryCalcModalVisible(false)}
                editingItem={editingItem}
            />
        </>
    );
};

export default DebtList;
