interface IReplyWithData {
    data: unknown;
    error?: never; // Ensures error is not used here
}

interface IReplyWithError {
    data?: never; // Ensures data is not used here
    error: {
        title: string;
        detail: string;
    };
}

export type IReply = IReplyWithData | IReplyWithError;
