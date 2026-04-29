package com.livepass.backend.config.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CPFValidator implements ConstraintValidator<CPF, String> {

    @Override
    public boolean isValid(String cpf, ConstraintValidatorContext context) {
        if (cpf == null || cpf.length() != 11 || cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        try {
            int d1 = calculateDigit(cpf.substring(0, 9), new int[]{10, 9, 8, 7, 6, 5, 4, 3, 2});
            int d2 = calculateDigit(cpf.substring(0, 9) + d1, new int[]{11, 10, 9, 8, 7, 6, 5, 4, 3, 2});
            return cpf.equals(cpf.substring(0, 9) + d1 + d2);
        } catch (Exception e) {
            return false;
        }
    }

    private int calculateDigit(String str, int[] weights) {
        int sum = 0;
        for (int i = str.length() - 1; i >= 0; i--) {
            sum += Integer.parseInt(str.substring(i, i + 1)) * weights[weights.length - str.length() + i];
        }
        sum = 11 - (sum % 11);
        return sum > 9 ? 0 : sum;
    }
}
