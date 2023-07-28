import { DatePicker, Form, Input, InputNumber, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { DataType } from '../DebtList';
import dayjs from 'dayjs';

const DebtEdit = ({
    visible,
    onCancel,
    onSave,
    editingItem,
}: {
    visible: boolean;
    onCancel: any;
    onSave: any;
    editingItem: any;
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        console.log(editingItem);
        let data = editingItem
            ? { ...editingItem, borrowingDate: dayjs(editingItem.borrowingDate) }
            : null;
        form.setFieldsValue(data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingItem]);

    const handleSave = () => {
        form.validateFields().then((values) => {
            onSave(values);
        });
    };

    return (
        <Modal title="edit" open={visible} onCancel={onCancel} onOk={handleSave} destroyOnClose>
            <Form form={form} preserve={true}>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter a name' }]}
                >
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    name="borrowingDate"
                    label="BorrowingDate"
                    rules={[{ required: true, message: 'Please enter borrowingDate' }]}
                >
                    <DatePicker />
                </Form.Item>
                <Form.Item
                    name="totalAmount"
                    label="TotalAmount"
                    rules={[{ required: true, message: 'Please enter totalAmount' }]}
                >
                    <InputNumber />
                </Form.Item>
                <Form.Item
                    name="rate"
                    label="Rate"
                    rules={[{ required: true, message: 'Please enter rate' }]}
                >
                    <InputNumber />
                </Form.Item>
                <Form.Item name="note" label="Note">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DebtEdit;
