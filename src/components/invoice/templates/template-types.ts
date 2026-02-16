import { DocumentData, LineItem } from "@/types/document";

export interface TemplateProps {
    data: DocumentData;
    pageItems: LineItem[];
    pageNumber: number;
    totalPages: number;
    isLastPage: boolean;
}
