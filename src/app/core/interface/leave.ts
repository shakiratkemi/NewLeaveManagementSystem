export interface LeaveItem {
  name: string;
  icon: string;
  link: string;
  children?: LeaveItem[];
  open?: boolean;
}
