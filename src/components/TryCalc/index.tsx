import { Button, DatePicker, Descriptions, Form, Input, InputNumber, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { DataType } from '../DebtList';
import dayjs from 'dayjs';

const TryCalc = ({
    visible,
    onCancel,
    editingItem,
}: {
    visible: boolean;
    onCancel: any;
    editingItem: any;
}) => {
    const [form] = Form.useForm();
    const [result, setResult] = useState(0);
    useEffect(() => {
        form.setFieldsValue({
            borrowingDate: dayjs(),
            rate: editingItem?.rate || 3,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingItem]);

    const tryCalc = () => {
        const { totalAmount, repayment, borrowingDate } = editingItem;
        let loanAmount = totalAmount; // 总借款金额
        let totalInterest = 0;
        const rate = form.getFieldValue('rate');
        const resultDate = form.getFieldValue('borrowingDate');
        const repaidMount = repayment.reduce((p: any, c: any) => p + c.amount, 0);
        const repayments = [
            ...repayment,
            repaidMount >= totalAmount
                ? {}
                : {
                      date: dayjs(resultDate).format(),
                      amount: totalAmount - repaidMount,
                  },
        ].sort((a: any, b: any) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
        repayments.forEach((item, index) => {
            const day = dayjs(item.date).diff(
                index === 0 ? borrowingDate : repayments[index - 1].date,
                'day'
            );
            totalInterest += ((loanAmount * rate) / 100) * (day / 365);
            loanAmount -= item.amount;
        });

        setResult(+Number(totalInterest * 10000).toFixed(2));
    };

    return (
        <Modal
            title="try calc"
            open={visible}
            onCancel={onCancel}
            okButtonProps={{
                style: {
                    display: 'none',
                },
            }}
            destroyOnClose
        >
            <Descriptions title={editingItem?.name}>
                {editingItem?.repayment?.map((item: any) => (
                    <Descriptions.Item span={3} label={item.date}>
                        {item.amount}
                    </Descriptions.Item>
                ))}
            </Descriptions>
            <Form form={form} preserve={true}>
                {editingItem?.repayment.reduce((p: any, c: any) => p + c.amount, 0) >=
                editingItem?.totalAmount ? null : (
                    <Form.Item
                        name="borrowingDate"
                        label="预计还款日期"
                        rules={[{ required: true, message: 'Please enter borrowingDate' }]}
                    >
                        <DatePicker />
                    </Form.Item>
                )}
                <Form.Item
                    name="rate"
                    label="Rate"
                    rules={[{ required: true, message: 'Please enter rate' }]}
                >
                    <InputNumber />
                </Form.Item>
            </Form>
            <Button onClick={tryCalc}>TRY CALC</Button>
            <p className='text-lg bg-orange-100 my-2 w-24 px-4'>{result}</p>
        </Modal>
    );
};

export default TryCalc;
