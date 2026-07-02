import ToolTip from '@/components/ToolTip';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, SlidersHorizontal, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PresentationConfig, ToneType, VerbosityType } from '../type';

interface ConfigurationSelectsProps {
    config: PresentationConfig;
    onConfigChange: (key: keyof PresentationConfig, value: any) => void;
}

const toggleClassName =
    'h-[22px] w-[36px] border-0 bg-[#D8D8DD] data-[state=checked]:bg-[#7A5AF8] ';

const toneLabels: Record<ToneType, string> = {
    [ToneType.Default]: '默认',
    [ToneType.Casual]: '轻松',
    [ToneType.Professional]: '专业',
    [ToneType.Funny]: '幽默',
    [ToneType.Educational]: '教育',
    [ToneType.Sales_Pitch]: '销售演示',
};

const verbosityLabels: Record<VerbosityType, string> = {
    [VerbosityType.Concise]: '简洁',
    [VerbosityType.Standard]: '标准',
    [VerbosityType.Text_Heavy]: '详细',
};

const AdvanceSettings = ({ config, onConfigChange }: ConfigurationSelectsProps) => {
    const [openAdvanced, setOpenAdvanced] = useState(false);

    const [advancedDraft, setAdvancedDraft] = useState({
        tone: config.tone,
        verbosity: config.verbosity,
        instructions: config.instructions,
        includeTableOfContents: config.includeTableOfContents,
        includeTitleSlide: config.includeTitleSlide,
    });

    const syncDraftFromConfig = () => {
        setAdvancedDraft({
            tone: config.tone,
            verbosity: config.verbosity,
            instructions: config.instructions,
            includeTableOfContents: config.includeTableOfContents,
            includeTitleSlide: config.includeTitleSlide,
        });
    };

    const handleOpenAdvanced = () => {
        syncDraftFromConfig();
        setOpenAdvanced(true);
    };

    const handleCloseAdvanced = () => {
        setOpenAdvanced(false);
    };

    const handleSaveAdvanced = () => {
        onConfigChange('tone', advancedDraft.tone);
        onConfigChange('verbosity', advancedDraft.verbosity);
        onConfigChange('instructions', advancedDraft.instructions);
        onConfigChange('includeTableOfContents', advancedDraft.includeTableOfContents);
        onConfigChange('includeTitleSlide', advancedDraft.includeTitleSlide);
        setOpenAdvanced(false);
    };

    useEffect(() => {
        if (!openAdvanced) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCloseAdvanced();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [openAdvanced]);

    return (
        <>
            <div className="ml-auto">
                <ToolTip content="高级设置">
                    <button
                        aria-label="高级设置"
                        title="高级设置"
                        type="button"
                        onClick={handleOpenAdvanced}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E4E5E8] bg-white text-[#1C1C27] shadow-sm transition hover:bg-[#F7F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5141E5]/25"
                        data-testid="advanced-settings-button"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </ToolTip>
            </div>

            {openAdvanced && (
                <div
                    className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center"
                    onClick={handleCloseAdvanced}
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="高级设置"
                        className="relative mx-auto mt-[108px] w-[calc(100vw-2rem)] max-w-[640px] overflow-visible"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={handleCloseAdvanced}
                            aria-label="关闭高级设置"
                            className="absolute -top-[62px] right-2 flex h-[50px] w-[50px] items-center justify-center rounded-full border border-[#E7E7EC] bg-white text-[#2C2B35] shadow-sm transition hover:bg-[#F8F8FB]"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>

                        <div className="overflow-hidden rounded-[24px] border border-[#E7E9F2] bg-[#F3F3F6] shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
                            <div className="border-b border-[#E4E6EF] bg-white px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4F0FF] text-[#6E59F5]">
                                        <SlidersHorizontal className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-syne text-xl font-semibold text-[#161622]">高级设置</h2>
                                        <p className="mt-1 font-syne text-sm text-[#666677]">调整演示文稿的生成风格与输出内容。</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#F3F3F6] px-6 py-6">
                                <div className="rounded-[22px] border border-[#E2E4EC] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Pencil className="h-4 w-4 text-[#6E59F5]" />
                                            <label className="font-syne text-sm font-semibold leading-none text-[#1F1D2A]">补充说明</label>
                                        </div>
                                        <Textarea
                                            value={advancedDraft.instructions}
                                            onChange={(event) =>
                                                setAdvancedDraft((prev) => ({ ...prev, instructions: event.target.value }))
                                            }
                                            placeholder="可填写语气要求、行业背景、受众对象、重点章节等说明"
                                            className="min-h-[120px] rounded-2xl border-[#DBDBE1] bg-white px-4 py-3 font-syne text-sm text-[#2C2B37] shadow-none focus-visible:ring-0"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <label className="font-syne text-sm font-semibold leading-none text-[#1F1D2A]">语气风格</label>
                                        <Select
                                            value={advancedDraft.tone}
                                            onValueChange={(value) =>
                                                setAdvancedDraft((prev) => ({ ...prev, tone: value as ToneType }))
                                            }
                                        >
                                            <SelectTrigger className="p-2.5 w-[140px] rounded-xl border-[#DBDBE1] bg-white font-syne text-sm font-medium text-[#2C2B37] shadow-none focus:ring-0 focus-visible:ring-0">
                                                <SelectValue placeholder="选择语气" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[120] font-syne">
                                                {Object.values(ToneType).map((tone) => (
                                                    <SelectItem key={tone} value={tone} className="text-sm font-medium">
                                                        {toneLabels[tone]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <label className="font-syne text-sm font-semibold leading-none text-[#1F1D2A]">内容详略</label>
                                        <Select
                                            value={advancedDraft.verbosity}
                                            onValueChange={(value) =>
                                                setAdvancedDraft((prev) => ({ ...prev, verbosity: value as VerbosityType }))
                                            }
                                        >
                                            <SelectTrigger className="p-2.5 w-[140px] rounded-xl border-[#DBDBE1] bg-white font-syne text-sm font-medium text-[#2C2B37] shadow-none focus:ring-0 focus-visible:ring-0">
                                                <SelectValue placeholder="选择详略" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[120] font-syne">
                                                {Object.values(VerbosityType).map((verbosity) => (
                                                    <SelectItem key={verbosity} value={verbosity} className="text-sm font-medium">
                                                        {verbosityLabels[verbosity]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <label className="font-syne text-sm font-semibold leading-none text-[#1F1D2A]">包含目录页</label>
                                        <Switch
                                            checked={advancedDraft.includeTableOfContents}
                                            onCheckedChange={(checked) =>
                                                setAdvancedDraft((prev) => ({ ...prev, includeTableOfContents: checked }))
                                            }
                                            className={toggleClassName}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <label className="font-syne text-sm font-semibold leading-none text-[#1F1D2A]">包含标题页</label>
                                        <Switch
                                            checked={advancedDraft.includeTitleSlide}
                                            onCheckedChange={(checked) =>
                                                setAdvancedDraft((prev) => ({ ...prev, includeTitleSlide: checked }))
                                            }
                                            className={toggleClassName}
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={handleCloseAdvanced} className="rounded-full px-5">
                                        取消
                                    </Button>
                                    <Button type="button" onClick={handleSaveAdvanced} className="rounded-full px-5 bg-[#6E59F5] hover:bg-[#5E47EF]">
                                        保存设置
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdvanceSettings;
