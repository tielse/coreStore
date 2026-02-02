// Dùng cho Trừ tồn kho, Báo cáo doanh thu, Disable chỉnh sửa giá
export class BikeSoldEvent {
  constructor(
    readonly bikeId: string,
    readonly orderId: string,
    readonly occurredAt: Date = new Date(),
  ) {}
}
