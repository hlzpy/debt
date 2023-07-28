import dayjs from "dayjs";
import { DataType } from "../components/DebtList";

export function calcTry(rate: number, editingItem: DataType, resultDate: string): number {
    if (rate <= 0) {
        return 0;
    }
    const { totalAmount, repayment, borrowingDate } = editingItem;
    let loanAmount = totalAmount; // 总借款金额
    let totalInterest = 0;
    const repaidMount = repayment.reduce((p: any, c: any) => p + c.amount, 0);
    const repayments: { date: string; amount: number}[] | any = [
        ...repayment,
        repaidMount >= totalAmount
            ? {}
            : {
                  date: dayjs(resultDate).format(),
                  amount: totalAmount - repaidMount,
              },
    ].sort((a: any, b: any) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    repayments.forEach((item: { date: string | number | Date | dayjs.Dayjs | null | undefined; amount: number; }, index: number) => {
        const day = dayjs(item.date).diff(
            index === 0 ? borrowingDate : repayments[index - 1].date,
            'day'
        );
        totalInterest += ((loanAmount * rate) / 100) * (day / 365);
        loanAmount -= item.amount;
    });

    return +Number(totalInterest * 10000).toFixed(2);
}