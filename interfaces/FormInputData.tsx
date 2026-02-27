export interface IFormInputData {
  address: string;
  attribute: string[];
  prompt: string;
  foldersToSearch: string[];
  sort_order: string;
  availability: string;
  time_of_day: string;
  star_rating: number;
  current_salary: string[];
  estimated_salary: string[];
  paid_by: string;
  ready_to_work?: boolean;
}
