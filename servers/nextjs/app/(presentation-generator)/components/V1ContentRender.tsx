"use client";

import React, { useEffect, useMemo, useRef } from "react";
import EditableLayoutWrapper from "../components/EditableLayoutWrapper";
import SlideErrorBoundary from "../components/SlideErrorBoundary";
import TiptapTextReplacer from "../components/TiptapTextReplacer";
import { validate as uuidValidate } from 'uuid';
import { getLayoutByLayoutId } from "@/app/presentation-templates";
import { useCustomTemplateDetails } from "@/app/hooks/useCustomTemplates";
import AipptEditableCanvas from "./aippt-canvas/AipptEditableCanvas";
import AipptSlideCanvas from "./aippt-canvas/AipptSlideCanvas";
import {
    getCoalPowerStoredDocumentCandidate,
    isCoalPowerLayout,
    repairCoalPowerAipptSlideDocument,
} from "@/lib/pptx-model/coal-power-template";
import {
    getGeneralStoredDocumentCandidate,
    isGeneralLayout,
    repairGeneralAipptSlideDocument,
} from "@/lib/pptx-model/general-template";
import {
    getModernStoredDocumentCandidate,
    isModernLayout,
    repairModernAipptSlideDocument,
} from "@/lib/pptx-model/modern-template";
import {
    getStandardStoredDocumentCandidate,
    isStandardLayout,
    repairStandardAipptSlideDocument,
} from "@/lib/pptx-model/standard-template";
import {
    getSwiftStoredDocumentCandidate,
    isSwiftLayout,
    repairSwiftAipptSlideDocument,
} from "@/lib/pptx-model/swift-template";
import {
    getBuiltInTemplateStoredDocumentCandidate,
    isBuiltInTemplateLayout,
    repairBuiltInTemplateAipptSlideDocument,
} from "@/lib/pptx-model/built-in-template";
import { updateSlide, updateSlideContent } from "@/store/slices/presentationGeneration";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import type { AipptSlideDocument } from "@/lib/pptx-model/types";
import { validateNativeSlideDocument } from "@/lib/pptx-model/native-schema";
import { getSlideNativeCapability } from "@/lib/pptx-model/template-capabilities";
import {
    createLegacyOnlyAipptDocument,
    isLegacyTemplateOverlayDocument,
    toLegacyTemplateOverlayDocument,
} from "@/lib/pptx-model/legacy-overlay";

const fidelityModeText = {
    A: {
        label: "高保真原生编辑",
        hint: "",
    },
    B: {
        label: "结构化原生编辑",
        hint: "当前模板已转换为结构化编辑，复杂样式可能与原模板存在差异。",
    },
    C: {
        label: "导入背景编辑",
        hint: "当前导入页以背景保留原貌，可在其上添加和编辑新元素。",
    },
    D: {
        label: "兼容编辑",
        hint: "当前模板使用兼容编辑，暂不支持完整原生导出。",
    },
} as const;

function FidelityModeBadge({
    level,
}: {
    level: keyof typeof fidelityModeText,
}) {
    const text = fidelityModeText[level];

    return (
        <div className="pointer-events-none absolute left-3 top-3 z-40">
            <span
                className="pointer-events-auto block rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm"
                title={text.hint || text.label}
            >
                {text.label}
            </span>
        </div>
    );
}




export const V1ContentRender = ({
    slide,
    isEditMode,
    theme,
    onAipptInspectorChange,
}: {
    slide: any,
    isEditMode: boolean,
    theme?: any,
    enableEditMode?: boolean,
    onAipptInspectorChange?: (open: boolean) => void,
}) => {
    const dispatch = useDispatch();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const safeSlide = slide ?? {};
    const slideLayout = typeof safeSlide.layout === "string" ? safeSlide.layout : "";
    const slideLayoutGroup =
        typeof safeSlide.layout_group === "string" ? safeSlide.layout_group : "";
    const slideContent =
        safeSlide.content && typeof safeSlide.content === "object"
            ? safeSlide.content
            : {};

    const capability = useMemo(
        () =>
            getSlideNativeCapability({
                layout: slideLayout,
                layout_group: slideLayoutGroup,
                content: slideContent,
            }),
        [slideLayout, slideLayoutGroup, slideContent],
    );

    const storedAipptValidation = useMemo(() => {
        const validation = validateNativeSlideDocument(slideContent.__aippt);
        return validation;
    }, [slideContent.__aippt]);

    const storedAipptDocument = useMemo(() => {
        return storedAipptValidation.valid &&
            storedAipptValidation.document.meta?.fidelity !== "D" &&
            !isLegacyTemplateOverlayDocument(storedAipptValidation.document)
            ? storedAipptValidation.document
            : null;
    }, [storedAipptValidation]);

    const coalPowerStoredDocument = useMemo(() => {
        if (storedAipptDocument) return storedAipptDocument;
        if (!isCoalPowerLayout({
            layout: slideLayout,
            layout_group: slideLayoutGroup,
        })) {
            return null;
        }
        return getCoalPowerStoredDocumentCandidate(slideContent.__aippt);
    }, [
        slideContent.__aippt,
        slideLayout,
        slideLayoutGroup,
        storedAipptDocument,
    ]);

    const generalStoredDocument = useMemo(() => {
        if (storedAipptDocument) return storedAipptDocument;
        if (!isGeneralLayout({
            layout: slideLayout,
            layout_group: slideLayoutGroup,
        })) {
            return null;
        }
        return getGeneralStoredDocumentCandidate(slideContent.__aippt);
    }, [
        slideContent.__aippt,
        slideLayout,
        slideLayoutGroup,
        storedAipptDocument,
    ]);

    const modernStoredDocument = useMemo(() => {
        if (storedAipptDocument) return storedAipptDocument;
        if (!isModernLayout({
            layout: slideLayout,
            layout_group: slideLayoutGroup,
        })) {
            return null;
        }
        return getModernStoredDocumentCandidate(slideContent.__aippt);
    }, [
        slideContent.__aippt,
        slideLayout,
        slideLayoutGroup,
        storedAipptDocument,
    ]);

    const standardStoredDocument = useMemo(() => {
        if (storedAipptDocument) return storedAipptDocument;
        if (!isStandardLayout({
            layout: slideLayout,
            layout_group: slideLayoutGroup,
        })) {
            return null;
        }
        return getStandardStoredDocumentCandidate(slideContent.__aippt);
    }, [
        slideContent.__aippt,
        slideLayout,
        slideLayoutGroup,
        storedAipptDocument,
    ]);

    const swiftStoredDocument = useMemo(() => {
        if (storedAipptDocument) return storedAipptDocument;
        if (!isSwiftLayout({
            layout: slideLayout,
            layout_group: slideLayoutGroup,
        })) {
            return null;
        }
        return getSwiftStoredDocumentCandidate(slideContent.__aippt);
    }, [
        slideContent.__aippt,
        slideLayout,
        slideLayoutGroup,
        storedAipptDocument,
    ]);

    const builtInTemplateStoredDocument = useMemo(() => {
        if (storedAipptDocument) return storedAipptDocument;
        if (!isBuiltInTemplateLayout({
            layout: slideLayout,
            layout_group: slideLayoutGroup,
        })) {
            return null;
        }
        return getBuiltInTemplateStoredDocumentCandidate(slideContent.__aippt);
    }, [
        slideContent.__aippt,
        slideLayout,
        slideLayoutGroup,
        storedAipptDocument,
    ]);

    const legacyOverlayDocument = useMemo(() => {
        if (
            storedAipptValidation.valid &&
            isLegacyTemplateOverlayDocument(storedAipptValidation.document)
        ) {
            return toLegacyTemplateOverlayDocument(storedAipptValidation.document);
        }

        const shouldUseLegacyBackground =
            (capability.mode === "legacy-only" && capability.level === "D") ||
            (capability.mode === "convertible" && capability.level === "B");

        return shouldUseLegacyBackground
            ? createLegacyOnlyAipptDocument({
                id: safeSlide.id ?? safeSlide.index,
                layout: slideLayout,
                layoutGroup: slideLayoutGroup,
            })
            : null;
    }, [
        capability.mode,
        capability.level,
        safeSlide.id,
        safeSlide.index,
        slideLayout,
        slideLayoutGroup,
        storedAipptValidation,
    ]);

    const hasPersistedLegacyOverlay = useMemo(() => {
        return storedAipptValidation.valid &&
            isLegacyTemplateOverlayDocument(storedAipptValidation.document) &&
            storedAipptValidation.document.meta?.fidelity === "D";
    }, [storedAipptValidation]);

    useEffect(() => {
        if (!legacyOverlayDocument || hasPersistedLegacyOverlay) return;
        dispatch(
            updateSlide({
                index: safeSlide.index ?? 0,
                slide: {
                    ...safeSlide,
                    content: {
                        ...slideContent,
                        __aippt: legacyOverlayDocument,
                    },
                },
            })
        );
    }, [
        legacyOverlayDocument,
        hasPersistedLegacyOverlay,
        dispatch,
        safeSlide,
        slideContent,
    ]);

    const repairedCoalPowerDocument = useMemo(
        () =>
            repairCoalPowerAipptSlideDocument({
            id: safeSlide.id,
            index: safeSlide.index,
            layout: slideLayout,
            layout_group: slideLayoutGroup,
            content: slideContent,
        }, coalPowerStoredDocument),
        [
            safeSlide.id,
            safeSlide.index,
            slideLayout,
            slideLayoutGroup,
            slideContent,
            coalPowerStoredDocument,
        ],
    );

    const repairedGeneralDocument = useMemo(
        () =>
            repairGeneralAipptSlideDocument({
            id: safeSlide.id,
            index: safeSlide.index,
            layout: slideLayout,
            layout_group: slideLayoutGroup,
            content: slideContent,
        }, generalStoredDocument),
        [
            safeSlide.id,
            safeSlide.index,
            slideLayout,
            slideLayoutGroup,
            slideContent,
            generalStoredDocument,
        ],
    );

    const repairedModernDocument = useMemo(
        () =>
            repairModernAipptSlideDocument({
            id: safeSlide.id,
            index: safeSlide.index,
            layout: slideLayout,
            layout_group: slideLayoutGroup,
            content: slideContent,
        }, modernStoredDocument),
        [
            safeSlide.id,
            safeSlide.index,
            slideLayout,
            slideLayoutGroup,
            slideContent,
            modernStoredDocument,
        ],
    );

    const repairedStandardDocument = useMemo(
        () =>
            repairStandardAipptSlideDocument({
            id: safeSlide.id,
            index: safeSlide.index,
            layout: slideLayout,
            layout_group: slideLayoutGroup,
            content: slideContent,
        }, standardStoredDocument),
        [
            safeSlide.id,
            safeSlide.index,
            slideLayout,
            slideLayoutGroup,
            slideContent,
            standardStoredDocument,
        ],
    );

    const repairedSwiftDocument = useMemo(
        () =>
            repairSwiftAipptSlideDocument({
            id: safeSlide.id,
            index: safeSlide.index,
            layout: slideLayout,
            layout_group: slideLayoutGroup,
            content: slideContent,
        }, swiftStoredDocument),
        [
            safeSlide.id,
            safeSlide.index,
            slideLayout,
            slideLayoutGroup,
            slideContent,
            swiftStoredDocument,
        ],
    );

    const repairedBuiltInTemplateDocument = useMemo(
        () =>
            repairBuiltInTemplateAipptSlideDocument({
            id: safeSlide.id,
            index: safeSlide.index,
            layout: slideLayout,
            layout_group: slideLayoutGroup,
            content: slideContent,
        }, builtInTemplateStoredDocument),
        [
            safeSlide.id,
            safeSlide.index,
            slideLayout,
            slideLayoutGroup,
            slideContent,
            builtInTemplateStoredDocument,
        ],
    );

    const aipptDocument =
        repairedCoalPowerDocument ?? repairedGeneralDocument ?? repairedModernDocument ?? repairedStandardDocument ?? repairedSwiftDocument ?? repairedBuiltInTemplateDocument ?? storedAipptDocument;
    const fidelityLevel = aipptDocument?.meta?.fidelity ?? capability.level;

    const customTemplateId = slideLayoutGroup.startsWith("custom-") ? slideLayoutGroup.split("custom-")[1] : slideLayoutGroup;
    const isCustomTemplate = uuidValidate(customTemplateId) || slideLayoutGroup.startsWith("custom-");

    // Always call the hook (React hooks rule), but with empty id when not a custom template
    const { template: customTemplate, loading: customLoading } = useCustomTemplateDetails({
        id: isCustomTemplate ? customTemplateId : "",
        name: isCustomTemplate ? slideLayoutGroup : "",
        description: ""
    });


    // Memoize layout resolution to prevent unnecessary recalculations
    const Layout = useMemo(() => {
        if (isCustomTemplate) {
            if (customTemplate) {
                const layoutId = slideLayout.startsWith("custom-") ? slideLayout.split(":")[1] : slideLayout;


                const compiledLayout = customTemplate.layouts.find(
                    (layout) => layout.layoutId === layoutId
                );


                return compiledLayout?.component ?? null;
            }
            return null;
        } else {
            const template = getLayoutByLayoutId(slideLayout, slideLayoutGroup);
            return template?.component ?? null;
        }
    }, [isCustomTemplate, customTemplate, slideLayout, slideLayoutGroup]);

    // Show loading state for custom templates
    if (isCustomTemplate && customLoading) {
        return (
            <div className="flex flex-col items-center justify-center aspect-video h-full bg-gray-100 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }

    if (aipptDocument) {
        const updateAipptDocument = (nextDocument: AipptSlideDocument) => {
            dispatch(
                updateSlide({
                    index: safeSlide.index ?? 0,
                    slide: {
                        ...safeSlide,
                        content: {
                            ...slideContent,
                            __aippt: nextDocument,
                        },
                    },
                })
            );
        };

        return (
            <SlideErrorBoundary label={`Slide ${(safeSlide.index ?? 0) + 1}`}>
                <div className="relative h-full w-full">
                    <FidelityModeBadge level={fidelityLevel} />
                    {isEditMode ? (
                        <AipptEditableCanvas
                            document={aipptDocument}
                            onChange={updateAipptDocument}
                            onInspectorChange={onAipptInspectorChange}
                        />
                    ) : (
                        <AipptSlideCanvas document={aipptDocument} />
                    )}
                </div>
            </SlideErrorBoundary>
        );
    }


    if (!Layout) {
        if (Object.keys(slideContent).length === 0) {
            return (
                <div className="flex flex-col items-center cursor-pointer justify-center aspect-video h-full bg-gray-100 rounded-lg">
                    <p className="text-gray-600 text-center text-base">Blank Slide</p>
                    <p className="text-gray-600 text-center text-sm">This slide is empty. Please add content to it using the edit button.</p>
                </div>
            )
        }
        return (
            <div className="flex flex-col items-center justify-center aspect-video h-full bg-gray-100 rounded-lg">
                <p className="text-gray-600 text-center text-base">
                    Layout &quot;{slideLayout || "unknown"}&quot; not found in &quot;
                    {slideLayoutGroup || "unknown"}&quot; Template
                </p>
            </div>
        );
    }
    const LayoutComp = Layout as React.ComponentType<{ data: any }>;

    if (legacyOverlayDocument) {
        const updateLegacyOverlayDocument = (nextDocument: AipptSlideDocument) => {
            dispatch(
                updateSlide({
                    index: safeSlide.index ?? 0,
                    slide: {
                        ...safeSlide,
                        content: {
                            ...slideContent,
                            __aippt: nextDocument,
                        },
                    },
                })
            );
        };
        const handleLegacyTextContentChange = (
            content: string,
            dataPath: string,
            slideIndex?: number
        ) => {
            if (dataPath && slideIndex !== undefined) {
                dispatch(
                    updateSlideContent({
                        slideIndex,
                        dataPath,
                        content,
                    })
                );
            }
        };
        const renderLegacyBackgroundContent = (readOnly: boolean) => (
            <div className="h-[720px] w-[1280px]">
                <TiptapTextReplacer
                    key={`legacy-background-${safeSlide.id ?? safeSlide.index ?? "slide"}-${readOnly ? "readonly" : "editable"}`}
                    slideData={slideContent}
                    slideIndex={safeSlide.index ?? 0}
                    readOnly={readOnly}
                    onContentChange={readOnly ? undefined : handleLegacyTextContentChange}
                >
                    <LayoutComp data={{
                        ...slideContent,
                        _logo_url__: theme ? theme.logo_url : null,
                        __companyName__: (theme && theme.company_name) ? theme.company_name : null,
                    }} />
                </TiptapTextReplacer>
            </div>
        );
        const legacyBackgroundLayer = isEditMode ? (
            <EditableLayoutWrapper
                slideIndex={safeSlide.index ?? 0}
                slideData={slideContent}
                properties={safeSlide.properties}
            >
                {renderLegacyBackgroundContent(false)}
            </EditableLayoutWrapper>
        ) : (
            renderLegacyBackgroundContent(true)
        );

        return (
            <SlideErrorBoundary label={`Slide ${(safeSlide.index ?? 0) + 1}`}>
                <div className="relative h-[720px] w-[1280px]">
                    <FidelityModeBadge level="D" />
                    {isEditMode ? (
                        <AipptEditableCanvas
                            document={legacyOverlayDocument}
                            onChange={updateLegacyOverlayDocument}
                            onInspectorChange={onAipptInspectorChange}
                            backgroundLayer={legacyBackgroundLayer}
                        />
                    ) : (
                        <>
                            {legacyBackgroundLayer}
                            <div className="pointer-events-none absolute inset-0 z-10">
                                <AipptSlideCanvas
                                    document={legacyOverlayDocument}
                                    transparentBackground
                                />
                            </div>
                        </>
                    )}
                </div>
            </SlideErrorBoundary>
        );
    }

    if (isEditMode) {
        return (
            <SlideErrorBoundary label={`Slide ${(safeSlide.index ?? 0) + 1}`}>
                <div ref={containerRef} className="relative">
                    <FidelityModeBadge level={fidelityLevel} />

                    <EditableLayoutWrapper
                        slideIndex={safeSlide.index ?? 0}
                        slideData={slideContent}
                        properties={safeSlide.properties}
                    >
                        <TiptapTextReplacer
                            key={safeSlide.id ?? safeSlide.index ?? "slide"}
                            slideData={slideContent}
                            slideIndex={safeSlide.index ?? 0}
                            onContentChange={(
                                content: string,
                                dataPath: string,
                                slideIndex?: number
                            ) => {
                                if (dataPath && slideIndex !== undefined) {
                                    dispatch(
                                        updateSlideContent({
                                            slideIndex: slideIndex,
                                            dataPath: dataPath,
                                            content: content,
                                        })
                                    );
                                }
                            }}
                        >
                            <LayoutComp data={{
                                ...slideContent,
                                _logo_url__: theme ? theme.logo_url : null,
                                __companyName__: (theme && theme.company_name) ? theme.company_name : null,
                            }} />
                        </TiptapTextReplacer>
                    </EditableLayoutWrapper>



                </div>
            </SlideErrorBoundary>

        );
    }
    return (
        <SlideErrorBoundary label={`Slide ${(safeSlide.index ?? 0) + 1}`}>
            <div ref={containerRef}>
                <TiptapTextReplacer
                    key={safeSlide.id ?? safeSlide.index ?? "slide"}
                    slideData={slideContent}
                    slideIndex={safeSlide.index ?? 0}
                    readOnly
                >
                    <LayoutComp data={{
                        ...slideContent,
                        _logo_url__: theme ? theme.logo_url : null,
                        __companyName__: (theme && theme.company_name) ? theme.company_name : null,
                    }} />
                </TiptapTextReplacer>
            </div>
        </SlideErrorBoundary>
    );
};
