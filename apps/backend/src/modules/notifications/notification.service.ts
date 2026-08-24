import { EntityManager } from "typeorm";
import { AppDataSource } from "@/data-source";
import {
  NotificationEntity,
  NotificationType,
  TargetType,
} from "@/database/entities/notification.entity";

type Base<T extends NotificationType, TT extends TargetType> = {
  userId: string;
  type: T;
  target: { type: TT; id: string };
};

/**
 * Tham số của từng loại thông báo. Mỗi loại ràng buộc sẵn `target.type` tương ứng
 * nên caller không thể truyền lệch, và `target_type`/`target_id` luôn đi cùng nhau
 * đúng theo ràng buộc `chk_notifications_target` của bảng.
 */
export type CreateNotificationInput =
  | Base<"ACCOUNT_LOCKED", "USER">
  | Base<"ACCOUNT_UNLOCKED", "USER">
  | (Base<"COMPANY_LOCKED", "COMPANY"> & { params: { companyName: string } })
  | (Base<"COMPANY_UNLOCKED", "COMPANY"> & { params: { companyName: string } })
  | (Base<"JOB_APPROVED", "JOB"> & { params: { jobTitle: string } })
  | (Base<"JOB_REJECTED", "JOB"> & { params: { jobTitle: string; reason: string } })
  | (Base<"JOB_DELETED", "JOB"> & { params: { jobTitle: string; reason: string } })
  | (Base<"NEW_APPLICATION", "APPLICATION"> & {
      params: { candidateName: string; jobTitle: string };
    })
  | (Base<"APPLICATION_STATUS_CHANGED", "APPLICATION"> & {
      params: { jobTitle: string; status: string };
    });

type RenderedNotification = { title: string; content: string };

type TemplateOf<K extends NotificationType> = (
  input: Extract<CreateNotificationInput, { type: K }>,
) => RenderedNotification;

/**
 * Câu chữ do backend sinh, frontend không gửi title/content.
 * Lưu ý: thông báo khóa tài khoản và khóa công ty KHÔNG kèm lý do —
 * lý do chỉ được lưu ở `system_logs.description`.
 */
const TEMPLATES: { [K in NotificationType]: TemplateOf<K> } = {
  ACCOUNT_LOCKED: () => ({
    title: "Tài khoản bị khóa",
    content:
      "Tài khoản của bạn đã bị quản trị viên khóa. Vui lòng liên hệ bộ phận hỗ trợ nếu cần thêm thông tin.",
  }),
  ACCOUNT_UNLOCKED: () => ({
    title: "Tài khoản được mở khóa",
    content: "Tài khoản của bạn đã được mở khóa. Bạn có thể tiếp tục sử dụng hệ thống.",
  }),
  COMPANY_LOCKED: ({ params }) => ({
    title: "Công ty bị khóa",
    content: `Công ty "${params.companyName}" đã bị quản trị viên khóa. Các tin tuyển dụng của công ty sẽ tạm thời không hiển thị.`,
  }),
  COMPANY_UNLOCKED: ({ params }) => ({
    title: "Công ty được mở khóa",
    content: `Công ty "${params.companyName}" đã được mở khóa. Các tin tuyển dụng sẽ hiển thị trở lại.`,
  }),
  JOB_APPROVED: ({ params }) => ({
    title: "Tin tuyển dụng được duyệt",
    content: `Tin tuyển dụng "${params.jobTitle}" đã được duyệt và hiển thị công khai.`,
  }),
  JOB_REJECTED: ({ params }) => ({
    title: "Tin tuyển dụng bị từ chối",
    content: `Tin tuyển dụng "${params.jobTitle}" đã bị từ chối. Lý do: ${params.reason}`,
  }),
  JOB_DELETED: ({ params }) => ({
    title: "Tin tuyển dụng bị gỡ",
    content: `Tin tuyển dụng "${params.jobTitle}" đã bị gỡ khỏi hệ thống. Lý do: ${params.reason}`,
  }),
  // TODO(Nhóm 3): xác nhận lại tham số và câu chữ mong muốn.
  NEW_APPLICATION: ({ params }) => ({
    title: "Có ứng viên mới",
    content: `${params.candidateName} vừa ứng tuyển vào tin "${params.jobTitle}".`,
  }),
  // TODO(Nhóm 2/3): xác nhận lại tham số và câu chữ mong muốn.
  APPLICATION_STATUS_CHANGED: ({ params }) => ({
    title: "Trạng thái hồ sơ thay đổi",
    content: `Hồ sơ ứng tuyển của bạn cho tin "${params.jobTitle}" đã chuyển sang trạng thái ${params.status}.`,
  }),
};

const render = (input: CreateNotificationInput): RenderedNotification => {
  const template = TEMPLATES[input.type] as (
    value: CreateNotificationInput,
  ) => RenderedNotification;

  return template(input);
};

export const notificationService = {
  /**
   * Tạo một thông báo gửi tới một người dùng.
   *
   * Truyền `manager` khi muốn ghi trong transaction của caller; bỏ trống thì
   * ghi ngay bằng connection mặc định.
   */
  async create(
    input: CreateNotificationInput,
    manager?: EntityManager,
  ): Promise<NotificationEntity> {
    const repository = (manager ?? AppDataSource.manager).getRepository(NotificationEntity);
    const { title, content } = render(input);

    const notification = repository.create({
      userId: input.userId,
      type: input.type,
      title,
      content,
      targetType: input.target.type,
      targetId: input.target.id,
    });

    return repository.save(notification);
  },
};
