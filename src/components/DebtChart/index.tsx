import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';
import { DataType } from '../DebtList';
import dayjs from 'dayjs';
import { calcTry } from '../../utils/calc.util';

const DebtChart = () => {
    const [allData, setAllData] = useState<DataType[]>([]);

    useEffect(() => {
        getMockData();
    }, []);

    const getMockData = () => {
        axios
            .get('/data.json')
            .then((response) => {
                const allData = response?.data.sort((a: DataType, b: DataType) => {
                    const resultA =
                        a.totalAmount - +a.repayment.reduce((pre, cur) => pre + +cur.amount, 0);
                    const resultB =
                        b.totalAmount - +b.repayment.reduce((pre, cur) => pre + +cur.amount, 0);
                    return resultA - resultB;
                });
                renderChart(allData);
            })
            .catch((error) => {
                // 在这里处理错误
                console.error(error);
            });
    };

    const renderChart = (allData: DataType[]) => {
        const chartContainer = document.getElementById('echarts-container');
        const myChart = echarts.init(chartContainer);
        let totalBorrow = 0;
        let totalRepayment = 0;
        let totalInterest = 0;

        allData.forEach((item) => {
            totalBorrow += item.totalAmount;
            totalRepayment += item.repayment.reduce((pre, cur) => pre + cur.amount, 0);
            totalInterest += calcTry(item.rate, item, dayjs().format());
        });
        const totalResult = totalBorrow - totalRepayment;
        totalInterest = Number(totalInterest.toFixed(2));
        const options = {
            title: {
                text: 'This is demo',
                subtext: `totalAmount: ${totalBorrow}; totalRepayment: ${totalRepayment}; totalResult: ${totalResult}; rate: ${Number(
                    totalRepayment / totalBorrow
                ).toFixed(2)}`,
            },
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data: ['totalAmount', 'repayment', 'result'],
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true },
                },
            },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    data: allData?.map((item) => item.name),
                },
            ],
            yAxis: [
                {
                    type: 'value',
                },
            ],
            series: [
                {
                    name: 'totalAmount',
                    type: 'bar',
                    data: allData.map((item) => item.totalAmount),
                    markPoint: {
                        data: [
                            { type: 'max', name: 'Max' },
                            { type: 'min', name: 'Min' },
                        ],
                    },
                    markLine: {
                        data: [{ type: 'average', name: 'Avg' }],
                    },
                },
                {
                    name: 'repayment',
                    type: 'bar',
                    data: allData.map((item) =>
                        item.repayment.reduce((pre, cur) => pre + cur.amount, 0)
                    ),
                    markPoint: {
                        data: [
                            { type: 'max', name: 'Max' },
                            { type: 'min', name: 'Min' },
                        ],
                    },
                    markLine: {
                        data: [{ type: 'average', name: 'Avg' }],
                    },
                },
                {
                    name: 'result',
                    type: 'bar',
                    data: allData.map(
                        (item) =>
                            item.totalAmount -
                            item.repayment.reduce((pre, cur) => pre + cur.amount, 0)
                    ),
                    markLine: {
                        data: [{ type: 'average', name: 'Avg' }],
                    },
                },
            ],
        };

        myChart.setOption(options);
    };

    return (
        <>
            <div id="echarts-container" style={{ width: '80%', height: '400px' }}></div>
        </>
    );
};

export default DebtChart;
