import z from "zod";



const createCategoryZodSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string"
        }),
        description: z.string({
            required_error: "Description is required",
            invalid_type_error: "Description must be a string"
        }),
        credit: z.number({
            required_error: "credit is required",
            invalid_type_error: "credit must be a number"
        })
    })
});

const updateCategoryZodSchema = z.object({
    body: z.object({
        name: z.string({
            invalid_type_error: "Name must be a string"
        }).optional(),
        description: z.string({
            invalid_type_error: "Description must be a string"
        }).optional(),
        credit: z.number({
            invalid_type_error: "credit must be a number"
        }).optional()
    })
});


export const CategoryValidation = {
    createCategoryZodSchema,
    updateCategoryZodSchema
}
