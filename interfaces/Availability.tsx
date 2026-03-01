export interface IAvailability {
  document_id: string;
  availability: null | string;
  time_of_day: null | string;
  star_rating: null | number;
  current_salary: null | number;
  estimated_salary: null | number;
  paid_by: null | string;
  note: string;
  rating_info: {
    average: number;
    count: number;
  };
  has_rated: boolean;
  can_edit?: boolean;
}
