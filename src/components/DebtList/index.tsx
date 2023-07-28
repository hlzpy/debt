import React, { useEffect, useState } from 'react';
import Table, { ColumnsType } from 'antd/es/table';
import { Space, Typography, Modal, Tag } from 'antd';
import axios from 'axios';
import DebtDetail from '../DebtDetail';
import DebtEdit from '../DebtEdit';
import TryCalc from '../TryCalc';
import { calcTry } from '../../utils/calc.util';
import dayjs from 'dayjs';
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
            render: (_, record) => {
                const isReturnDone =
                    record.totalAmount -
                        record.repayment.reduce((pre, cur) => pre + +cur.amount, 0) <=
                    0;
                return isReturnDone ? (
                    <Tag bordered={false} color="success">
                        {record.name}
                    </Tag>
                ) : (
                    record.name
                );
            },
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
                <>{repayment.reduce((pre, cur) => pre + cur.amount, 0)}</>
            ),
            sorter: (a, b) => {
                const resultA = a.repayment.reduce((pre, cur) => pre + +cur.amount, 0);
                const resultB = b.repayment.reduce((pre, cur) => pre + +cur.amount, 0);
                return resultA - resultB;
            },
        },
        {
            title: 'result',
            key: 'id',
            dataIndex: 'result',
            render: (_, { repayment, totalAmount }) => {
                return +totalAmount - +repayment.reduce((pre, cur) => pre + +cur.amount, 0);
            },
            sorter: (a, b) => {
                const resultA =
                    a.totalAmount - +a.repayment.reduce((pre, cur) => pre + +cur.amount, 0);
                const resultB =
                    b.totalAmount - +b.repayment.reduce((pre, cur) => pre + +cur.amount, 0);
                return resultA - resultB;
            },
        },
        {
            title: 'tryCalc',
            key: 'tryCalc',
            dataIndex: 'tryCalc',
            render: (_, record) => {
                const { rate } = record;
                return calcTry(rate, record, dayjs().format());
            },
            sorter: (a, b) => {
                const resultA = calcTry(a.rate, a, dayjs().format());
                const resultB = calcTry(b.rate, b, dayjs().format());
                return resultA - resultB;
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
            item.id === editingItem?.id
                ? {
                      ...item,
                      ...{
                          ...values,
                          borrowingDate: dayjs(values.borrowingDate).format('YYYY-MM-DD'),
                      },
                  }
                : item
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
                        let totalInterest = 0;

                        pageData.forEach((item) => {
                            totalBorrow += item.totalAmount;
                            totalRepayment += item.repayment.reduce(
                                (pre, cur) => pre + cur.amount,
                                0
                            );
                            totalInterest += calcTry(item.rate, item, dayjs().format());
                        });
                        const totalResult = totalBorrow - totalRepayment;
                        totalInterest = Number(totalInterest.toFixed(2));

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
                                    <Table.Summary.Cell index={5}>
                                        <Text>{totalInterest}</Text>
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
