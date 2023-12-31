import { z } from "zod";

const signupSchema = z.object({
  name: z.string(),
  username: z.string().min(5, "User name must be 5 characters long"),
  password: z.string().min(6, "Password must be 6 characters long"),
  mobile_no: z.string(),
  address: z.string(),
  details: z.string().optional(),
  is_public: z.boolean(),
});

export { signupSchema };
