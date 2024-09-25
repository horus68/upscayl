import { SelectTheme } from "./select-theme";
import { SaveOutputFolderToggle } from "./save-output-folder-toggle";
import { InputGpuId } from "./input-gpu-id";
import { CustomModelsFolderSelect } from "./select-custom-models-folder";
import { LogArea } from "./log-area";
import { SelectImageScale } from "./select-image-scale";
import { SelectImageFormat } from "./select-image-format";
import { DonateButton } from "./donate-button";
import React, { useEffect, useState } from "react";
import { themeChange } from "theme-change";
import { useAtom, useAtomValue } from "jotai";
import { customModelsPathAtom, scaleAtom } from "../../atoms/userSettingsAtom";
import { modelsListAtom } from "../../atoms/modelsListAtom";
import useLogger from "../hooks/use-logger";
import { InputCompression } from "./input-compression";
import OverwriteToggle from "./overwrite-toggle";
import { UpscaylCloudModal } from "../UpscaylCloudModal";
import { ResetSettingsButton } from "./reset-settings-button";
import { FEATURE_FLAGS } from "@common/feature-flags";
import TurnOffNotificationsToggle from "./turn-off-notifications-toggle";
import { cn } from "@/lib/utils";
import { InputCustomResolution } from "./input-custom-resolution";
import { InputTileSize } from "./input-tile-size";
import LanguageSwitcher from "./language-switcher";
import { translationAtom } from "@/atoms/translations-atom";

interface IProps {
  batchMode: boolean;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  saveImageAs: string;
  setSaveImageAs: React.Dispatch<React.SetStateAction<string>>;
  compression: number;
  setCompression: React.Dispatch<React.SetStateAction<number>>;
  gpuId: string;
  setGpuId: React.Dispatch<React.SetStateAction<string>>;
  logData: string[];
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setDontShowCloudModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function SettingsTab({
  batchMode,
  setModel,
  compression,
  setCompression,
  gpuId,
  setGpuId,
  saveImageAs,
  setSaveImageAs,
  logData,

  show,
  setShow,
  setDontShowCloudModal,
}: IProps) {
  const [isCopied, setIsCopied] = useState(false);

  const [customModelsPath, setCustomModelsPath] = useAtom(customModelsPathAtom);
  const modelOptions = useAtomValue(modelsListAtom);
  const [scale, setScale] = useAtom(scaleAtom);
  const [enableScrollbar, setEnableScrollbar] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);
  const t = useAtomValue(translationAtom);

  const logit = useLogger();

  useEffect(() => {
    themeChange(false);

    if (!localStorage.getItem("saveImageAs")) {
      logit("⚙️ Setting saveImageAs to png");
      localStorage.setItem("saveImageAs", "png");
    } else {
      const currentlySavedImageFormat = localStorage.getItem("saveImageAs");
      logit(
        "⚙️ Getting saveImageAs from localStorage: ",
        currentlySavedImageFormat,
      );
      setSaveImageAs(currentlySavedImageFormat);
    }

    if (!localStorage.getItem("model")) {
      setModel(modelOptions[0].value);
      localStorage.setItem("model", JSON.stringify(modelOptions[0]));
      logit("🔀 Setting model to", modelOptions[0].value);
    } else {
      let currentlySavedModel = JSON.parse(
        localStorage.getItem("model"),
      ) as (typeof modelOptions)[0];
      if (
        modelOptions.find(
          (model) => model.value === currentlySavedModel.value,
        ) === undefined
      ) {
        localStorage.setItem("model", JSON.stringify(modelOptions[0]));
        logit("🔀 Setting model to", modelOptions[0].value);
        currentlySavedModel = modelOptions[0];
      }
      setModel(currentlySavedModel.value);
      logit(
        "⚙️ Getting model from localStorage: ",
        JSON.stringify(currentlySavedModel),
      );
    }

    if (!localStorage.getItem("gpuId")) {
      localStorage.setItem("gpuId", "");
      logit("⚙️ Setting gpuId to empty string");
    } else {
      const currentlySavedGpuId = localStorage.getItem("gpuId");
      setGpuId(currentlySavedGpuId);
      logit("⚙️ Getting gpuId from localStorage: ", currentlySavedGpuId);
    }
  }, []);

  // HANDLERS
  const setExportType = (format: string) => {
    setSaveImageAs(format);
    localStorage.setItem("saveImageAs", format);
  };

  const handleCompressionChange = (e) => {
    setCompression(e.target.value);
  };

  const handleGpuIdChange = (e) => {
    setGpuId(e.target.value);
    localStorage.setItem("gpuId", e.target.value);
  };

  const copyOnClickHandler = () => {
    navigator.clipboard.writeText(logData.join("\n"));
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const upscaylVersion = navigator?.userAgent?.match(
    /Upscayl\/([\d\.]+\d+)/,
  )[1];

  function disableScrolling() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    setTimeoutId(
      setTimeout(function () {
        setEnableScrollbar(false);
      }, 1000),
    );
  }

  function enableScrolling() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    setEnableScrollbar(true);
  }

  return (
    <div
      className={cn(
        "animate-step-in animate z-50 flex h-screen flex-col gap-7 overflow-y-auto overflow-x-hidden p-5",
        enableScrollbar ? "" : "hide-scrollbar",
      )}
      onScroll={() => {
        if (enableScrollbar) disableScrolling();
      }}
      onWheel={() => {
        enableScrolling();
      }}
    >
      <div className="flex flex-col gap-2 text-sm font-medium uppercase">
        <p>{t("SETTINGS.SUPPORT.TITLE")}</p>
        <a
          className="btn btn-primary"
          href="https://docs.upscayl.org/"
          target="_blank"
        >
          {t("SETTINGS.SUPPORT.DOCS_BUTTON_TITLE")}
        </a>
        {FEATURE_FLAGS.APP_STORE_BUILD && (
          <a
            className="btn btn-primary"
            href={`mailto:upscayl@gmail.com?subject=Upscayl%20Issue%3A%20%3CIssue%20name%20here%3E&body=Device%20Name%3A%20%3CYOUR%20DEVICE%20MODEL%3E%0AOperating%20System%3A%20%3CYOUR%20OPERATING%20SYSTEM%20VERSION%3E%0AUpscayl%20Version%3A%20${upscaylVersion}%0A%0AHi%2C%20I'm%20having%20an%20issue%20with%20Upscayl.%20%3CDESCRIBE%20ISSUE%20HERE%3E`}
            target="_blank"
          >
            {t("SETTINGS.SUPPORT.EMAIL_BUTTON_TITLE")}
          </a>
        )}
        {!FEATURE_FLAGS.APP_STORE_BUILD && <DonateButton />}
      </div>

      <LogArea
        copyOnClickHandler={copyOnClickHandler}
        isCopied={isCopied}
        logData={logData}
      />

      {/* THEME SELECTOR */}
      <SelectTheme />

      <LanguageSwitcher />

      {/* IMAGE FORMAT BUTTONS */}
      <SelectImageFormat
        batchMode={batchMode}
        saveImageAs={saveImageAs}
        setExportType={setExportType}
      />

      {/* IMAGE SCALE */}
      <SelectImageScale scale={scale} setScale={setScale} />

      <InputCustomResolution />

      <InputCompression
        compression={compression}
        handleCompressionChange={handleCompressionChange}
      />

      <SaveOutputFolderToggle />

      <OverwriteToggle />
      <TurnOffNotificationsToggle />

      {/* GPU ID INPUT */}
      <InputGpuId gpuId={gpuId} handleGpuIdChange={handleGpuIdChange} />

      <InputTileSize />

      {/* CUSTOM MODEL */}
      <CustomModelsFolderSelect
        customModelsPath={customModelsPath}
        setCustomModelsPath={setCustomModelsPath}
      />

      {/* RESET SETTINGS */}
      <ResetSettingsButton />

      {FEATURE_FLAGS.SHOW_UPSCAYL_CLOUD_INFO && (
        <>
          <button
            className="mx-5 mb-5 animate-pulse rounded-btn bg-success p-1 text-sm text-slate-50 shadow-lg shadow-success/40"
            onClick={() => {
              setShow(true);
            }}
          >
            {t("INTRO")}
          </button>

          <UpscaylCloudModal
            show={show}
            setShow={setShow}
            setDontShowCloudModal={setDontShowCloudModal}
          />
        </>
      )}
    </div>
  );
}

export default SettingsTab;
