export interface Customer {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
}

export interface Project {
  ID: string;
  title: string;
  description: string;
  customer_id: string;
  Customer: Customer;
  status: boolean;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  customer_id: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  customer_id?: string;
}