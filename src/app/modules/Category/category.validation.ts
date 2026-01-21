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
        Reward: z.number({
            required_error: "Reward is required",
            invalid_type_error: "Reward must be a number"
        }),
        battleCost: z.number({
            required_error: "Battle cost is required",
            invalid_type_error: "Battle cost must be a number"
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
        Reward: z.number({
            invalid_type_error: "Reward must be a number"
        }).optional(),
        battleCost: z.number({
            invalid_type_error: "Battle cost must be a number"
        }).optional()
    })
});


export const CategoryValidation = {
    createCategoryZodSchema,
    updateCategoryZodSchema
}
