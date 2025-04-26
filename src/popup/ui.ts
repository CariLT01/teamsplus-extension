function m_confirmation() {
    return prompt("Confirm? Type 'y' or 'n'") === 'y';
}

export const confirmation = m_confirmation;